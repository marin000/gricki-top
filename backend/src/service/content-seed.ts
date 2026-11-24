import { readFile } from "node:fs/promises";
import path from "node:path";

import type { ContentPack } from "../interface";
import { AppConfig, ContentSource, DailyQuiz, Question, Story } from "../models";
import { validateContentPack } from "./content-validate";
import { publishAtForDay } from "./time";

const DEFAULT_PACK_PATH = path.resolve(process.cwd(), "content/gricki-top.seed.json");

export const loadContentPack = async (filePath = DEFAULT_PACK_PATH): Promise<ContentPack> => {
	const raw = await readFile(filePath, "utf8");
	return JSON.parse(raw) as ContentPack;
};

export const seedContentPack = async (options: {
	startDate: string;
	dryRun?: boolean;
	filePath?: string;
}): Promise<{ dryRun: boolean; contentPackVersion: string; contentStartDate: string }> => {
	const pack = await loadContentPack(options.filePath);
	validateContentPack(pack);

	if (!/^\d{4}-\d{2}-\d{2}$/.test(options.startDate)) {
		throw new Error("Invalid start date");
	}

	if (options.dryRun) {
		return {
			dryRun: true,
			contentPackVersion: pack.contentPackVersion,
			contentStartDate: options.startDate,
		};
	}

	const sourceOps = pack.sources.map((source) => ({
		updateOne: {
			filter: { id: source.id },
			update: {
				$set: {
					id: source.id,
					title: source.title,
					publisher: source.publisher,
					url: source.url,
					checkedAt: new Date(source.checkedAt),
				},
			},
			upsert: true,
		},
	}));

	const stories = [pack.mainStory, ...pack.stories];
	const storyOps = stories.map((story) => ({
		updateOne: {
			filter: { id: story.id },
			update: {
				$set: {
					id: story.id,
					dayNumber: story.dayNumber,
					isMain: story.isMain,
					title: story.title,
					lead: story.lead,
					paragraphs: story.paragraphs,
					category: story.category,
					sourceIds: story.sourceIds,
					status: story.status as "draft" | "approved" | "retired",
					publishAt: story.isMain || story.dayNumber === null ? null : publishAtForDay(options.startDate, story.dayNumber),
					version: story.version,
					contentHash: story.contentHash,
				},
			},
			upsert: true,
		},
	}));

	const questionOps = pack.questions.map((question) => ({
		updateOne: {
			filter: { id: question.id },
			update: {
				$set: {
					id: question.id,
					factKey: question.factKey,
					sourceStoryId: question.sourceStoryId,
					prompt: question.prompt,
					options: question.options,
					correctOptionId: question.correctOptionId,
					explanation: question.explanation,
					sourceIds: question.sourceIds,
					version: question.version,
					status: question.status as "approved" | "retired",
				},
			},
			upsert: true,
		},
	}));

	const quizOps = pack.dailyQuizzes.map((quiz) => ({
		updateOne: {
			filter: { id: quiz.id },
			update: {
				$set: {
					id: quiz.id,
					dayNumber: quiz.dayNumber,
					storyId: quiz.storyId,
					questionIds: quiz.questionIds,
					publishAt: publishAtForDay(options.startDate, quiz.dayNumber),
					status: quiz.status as "draft" | "approved" | "retired",
					version: quiz.version,
					contentHash: quiz.contentHash,
				},
			},
			upsert: true,
		},
	}));

	await ContentSource.bulkWrite(sourceOps);
	await Story.bulkWrite(storyOps as Parameters<typeof Story.bulkWrite>[0]);
	await Question.bulkWrite(questionOps as Parameters<typeof Question.bulkWrite>[0]);
	await DailyQuiz.bulkWrite(quizOps as Parameters<typeof DailyQuiz.bulkWrite>[0]);

	const existing = await AppConfig.findOne({ key: "app" }).exec();
	if (existing) {
		existing.contentPackVersion = pack.contentPackVersion;
		existing.timezone = pack.timezone;
		existing.activeDayCount = 100;
		await existing.save();
	} else {
		await AppConfig.create({
			key: "app",
			contentStartDate: options.startDate,
			timezone: pack.timezone,
			contentPackVersion: pack.contentPackVersion,
			activeDayCount: 100,
		});
	}

	return {
		dryRun: false,
		contentPackVersion: pack.contentPackVersion,
		contentStartDate: existing?.contentStartDate ?? options.startDate,
	};
};
