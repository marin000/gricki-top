import { AppConfig, DailyQuiz, Story } from "../models";
import { publishAtForDay } from "./time";

export const resetContentSchedule = async (options: {
	startDate: string;
	dryRun?: boolean;
}): Promise<{
	dryRun: boolean;
	contentStartDate: string;
	storiesUpdated: number;
	quizzesUpdated: number;
}> => {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(options.startDate)) {
		throw new Error("Invalid start date");
	}

	const stories = await Story.find({ isMain: false, dayNumber: { $ne: null } })
		.select("id dayNumber")
		.lean()
		.exec();
	const quizzes = await DailyQuiz.find().select("id dayNumber").lean().exec();

	if (options.dryRun) {
		return {
			dryRun: true,
			contentStartDate: options.startDate,
			storiesUpdated: stories.length,
			quizzesUpdated: quizzes.length,
		};
	}

	const storyOps = stories.map((story) => ({
		updateOne: {
			filter: { id: story.id },
			update: {
				$set: {
					publishAt: publishAtForDay(options.startDate, Number(story.dayNumber)),
				},
			},
		},
	}));

	const quizOps = quizzes.map((quiz) => ({
		updateOne: {
			filter: { id: quiz.id },
			update: {
				$set: {
					publishAt: publishAtForDay(options.startDate, quiz.dayNumber),
				},
			},
		},
	}));

	if (storyOps.length > 0) {
		await Story.bulkWrite(storyOps);
	}
	if (quizOps.length > 0) {
		await DailyQuiz.bulkWrite(quizOps);
	}

	await AppConfig.findOneAndUpdate(
		{ key: "app" },
		{
			$set: { contentStartDate: options.startDate },
			$setOnInsert: {
				key: "app",
				timezone: "Europe/Zagreb",
				contentPackVersion: "unknown",
				activeDayCount: 100,
			},
		},
		{ upsert: true },
	).exec();

	return {
		dryRun: false,
		contentStartDate: options.startDate,
		storiesUpdated: storyOps.length,
		quizzesUpdated: quizOps.length,
	};
};
