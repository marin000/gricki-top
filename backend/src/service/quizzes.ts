import { DailyQuiz, QuizAttempt, Story } from "../models";

export const getQuizMetadata = async (
	quizId: string,
	deviceId: string,
	now: Date = new Date(),
) => {
	const quiz = await DailyQuiz.findOne({ id: quizId, status: "approved" })
		.lean()
		.exec();
	if (
		!quiz ||
		!quiz.publishAt ||
		new Date(quiz.publishAt).getTime() > now.getTime()
	) {
		return null;
	}

	const story = await Story.findOne({ id: quiz.storyId, status: "approved" })
		.lean()
		.exec();
	if (
		!story ||
		!story.publishAt ||
		new Date(story.publishAt).getTime() > now.getTime()
	) {
		return null;
	}

	const attempt = await QuizAttempt.findOne({ deviceId, dailyQuizId: quiz.id })
		.lean()
		.exec();

	return {
		id: quiz.id,
		dayNumber: quiz.dayNumber,
		storyId: quiz.storyId,
		storyTitle: story.title,
		questionCount: quiz.questionIds.length,
		publishAt: quiz.publishAt.toISOString(),
		version: quiz.version,
		attempt: attempt
			? {
					id: attempt.id,
					status: attempt.status,
					score: attempt.score ?? null,
					nextQuestionIndex: attempt.nextQuestionIndex,
					startedAt: attempt.startedAt.toISOString(),
					completedAt: attempt.completedAt
						? attempt.completedAt.toISOString()
						: null,
				}
			: null,
	};
};
