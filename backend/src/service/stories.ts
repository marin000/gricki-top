import {
	ContentSource,
	DailyQuiz,
	QuizAttempt,
	Story,
	StoryProgress,
} from "../models";
import { decodeStoryCursor, encodeStoryCursor } from "../utils";
import { isStoryAvailable } from "./content-access";

const mapSource = (source: {
	id: string;
	title: string;
	publisher: string;
	url: string;
	checkedAt: Date;
}) => ({
	id: source.id,
	title: source.title,
	publisher: source.publisher,
	url: source.url,
	checkedAt: source.checkedAt.toISOString(),
});

const mapStorySummary = (story: {
	id: string;
	dayNumber?: number | null;
	isMain: boolean;
	title: string;
	lead: string;
	category: string;
	publishAt?: Date | null;
	version: number;
}) => ({
	id: story.id,
	dayNumber: story.dayNumber ?? null,
	isMain: story.isMain,
	title: story.title,
	lead: story.lead,
	category: story.category,
	publishAt: story.publishAt ? story.publishAt.toISOString() : null,
	version: story.version,
});

export const listPublishedStories = async (options: {
	limit: number;
	cursor?: string;
	now?: Date;
}) => {
	const now = options.now ?? new Date();
	const limit = Math.min(Math.max(options.limit, 1), 50);
	const filter: Record<string, unknown> = {
		status: "approved",
		isMain: false,
		publishAt: { $ne: null, $lte: now },
	};

	if (options.cursor) {
		const decoded = decodeStoryCursor(options.cursor);
		if (!decoded) {
			throw new Error("INVALID_CURSOR");
		}
		const cursorDate = new Date(decoded.publishAt);
		filter.$or = [
			{ publishAt: { $lt: cursorDate } },
			{ publishAt: cursorDate, id: { $lt: decoded.id } },
		];
	}

	const rows = await Story.find(filter)
		.sort({ publishAt: -1, id: -1 })
		.limit(limit + 1)
		.lean()
		.exec();
	const page = rows.slice(0, limit);
	const next = rows.length > limit ? page[page.length - 1] : null;

	return {
		items: page.map(mapStorySummary),
		nextCursor: next?.publishAt
			? encodeStoryCursor(new Date(next.publishAt), next.id)
			: null,
	};
};

export const getMainStory = async () => {
	const story = await Story.findOne({
		id: "MAIN",
		status: "approved",
		isMain: true,
	})
		.lean()
		.exec();
	if (!story || !isStoryAvailable(story)) {
		return null;
	}

	const sources = await ContentSource.find({ id: { $in: story.sourceIds } })
		.lean()
		.exec();
	return {
		...mapStorySummary(story),
		paragraphs: story.paragraphs,
		sourceIds: story.sourceIds,
		sources: sources.map(mapSource),
	};
};

export const getStoryById = async (
	storyId: string,
	deviceId: string,
	now: Date = new Date(),
) => {
	const story = await Story.findOne({ id: storyId }).lean().exec();
	if (!story || !isStoryAvailable(story, now)) {
		return null;
	}

	const [sources, progress, quiz] = await Promise.all([
		ContentSource.find({ id: { $in: story.sourceIds } })
			.lean()
			.exec(),
		StoryProgress.findOne({ deviceId, storyId }).lean().exec(),
		story.dayNumber
			? DailyQuiz.findOne({ dayNumber: story.dayNumber, status: "approved" })
					.lean()
					.exec()
			: Promise.resolve(null),
	]);

	let quizStatus: {
		dailyQuizId: string;
		attemptStatus: "none" | "in_progress" | "completed";
		score: number | null;
	} | null = null;

	if (
		quiz &&
		quiz.publishAt &&
		new Date(quiz.publishAt).getTime() <= now.getTime()
	) {
		const attempt = await QuizAttempt.findOne({
			deviceId,
			dailyQuizId: quiz.id,
		})
			.lean()
			.exec();
		quizStatus = {
			dailyQuizId: quiz.id,
			attemptStatus: attempt?.status ?? "none",
			score: attempt?.score ?? null,
		};
	}

	return {
		...mapStorySummary(story),
		paragraphs: story.paragraphs,
		sourceIds: story.sourceIds,
		sources: sources.map(mapSource),
		readAt: progress?.readAt ? progress.readAt.toISOString() : null,
		promptDismissedAt: progress?.promptDismissedAt
			? progress.promptDismissedAt.toISOString()
			: null,
		quiz: quizStatus,
	};
};
