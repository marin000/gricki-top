import type { DeviceSettings } from "../interface";
import {
	DailyQuiz,
	Device,
	QuizAttempt,
	Story,
	StoryProgress,
} from "../models";
import { isStoryAvailable } from "./content-access";

export const upsertStoryProgress = async (input: {
	deviceId: string;
	storyId: string;
	markRead?: boolean;
	dismissPrompt?: boolean;
	clientUpdatedAt?: Date;
	now?: Date;
}) => {
	const now = input.now ?? new Date();
	const story = await Story.findOne({ id: input.storyId }).lean().exec();
	if (!story || !isStoryAvailable(story, now)) {
		return { status: "unavailable" as const };
	}

	const existing = await StoryProgress.findOne({
		deviceId: input.deviceId,
		storyId: input.storyId,
	}).exec();
	const doc =
		existing ??
		new StoryProgress({
			deviceId: input.deviceId,
			storyId: input.storyId,
		});

	if (input.markRead && !doc.readAt) {
		doc.readAt = now;
	}
	if (input.dismissPrompt && !doc.promptDismissedAt) {
		doc.promptDismissedAt = now;
	}
	if (input.clientUpdatedAt) {
		doc.clientUpdatedAt = input.clientUpdatedAt;
	}

	await doc.save();

	return {
		status: "ok" as const,
		storyId: doc.storyId,
		readAt: doc.readAt ? doc.readAt.toISOString() : null,
		promptDismissedAt: doc.promptDismissedAt
			? doc.promptDismissedAt.toISOString()
			: null,
	};
};

export const getDeviceProgress = async (
	deviceId: string,
	now: Date = new Date(),
) => {
	const [device, progressRows, attempts, publishedQuizzes] = await Promise.all([
		Device.findOne({ deviceId }).lean().exec(),
		StoryProgress.find({ deviceId }).lean().exec(),
		QuizAttempt.find({ deviceId }).lean().exec(),
		DailyQuiz.find({ status: "approved", publishAt: { $lte: now } })
			.select("id dayNumber")
			.lean()
			.exec(),
	]);

	const attemptByQuiz = new Map(
		attempts.map((attempt) => [attempt.dailyQuizId, attempt]),
	);

	return {
		settings: (device?.settings as DeviceSettings | undefined) ?? null,
		stories: progressRows.map((row) => ({
			storyId: row.storyId,
			readAt: row.readAt ? row.readAt.toISOString() : null,
			promptDismissedAt: row.promptDismissedAt
				? row.promptDismissedAt.toISOString()
				: null,
		})),
		quizzes: publishedQuizzes.map((quiz) => {
			const attempt = attemptByQuiz.get(quiz.id);
			return {
				dailyQuizId: quiz.id,
				dayNumber: quiz.dayNumber,
				attemptStatus: attempt?.status ?? "none",
				score: attempt?.score ?? null,
			};
		}),
	};
};

const asBool = (value: unknown, fallback: boolean): boolean => {
	if (typeof value === "boolean") {
		return value;
	}
	if (value === "true" || value === 1 || value === "1") {
		return true;
	}
	if (value === "false" || value === 0 || value === "0") {
		return false;
	}
	return fallback;
};

export const patchDeviceSettings = async (
	deviceId: string,
	patch: Partial<DeviceSettings>,
): Promise<DeviceSettings | null> => {
	const device = await Device.findOne({ deviceId }).exec();
	if (!device) {
		return null;
	}

	const current = (device.settings as DeviceSettings | undefined) ?? {
		soundEnabled: true,
		hapticsEnabled: true,
		reminderEnabled: false,
		reminderLeadMinutes: 1,
	};

	const next: DeviceSettings = {
		soundEnabled:
			patch.soundEnabled !== undefined
				? asBool(patch.soundEnabled, current.soundEnabled)
				: current.soundEnabled,
		hapticsEnabled:
			patch.hapticsEnabled !== undefined
				? asBool(patch.hapticsEnabled, current.hapticsEnabled)
				: current.hapticsEnabled,
		reminderEnabled:
			patch.reminderEnabled !== undefined
				? asBool(patch.reminderEnabled, current.reminderEnabled)
				: current.reminderEnabled,
		reminderLeadMinutes:
			typeof patch.reminderLeadMinutes === "number"
				? patch.reminderLeadMinutes
				: current.reminderLeadMinutes,
	};

	await Device.updateOne({ deviceId }, { $set: { settings: next } }).exec();
	return next;
};
