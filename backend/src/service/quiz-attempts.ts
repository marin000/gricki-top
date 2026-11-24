import { randomUUID } from "node:crypto";

import { DailyQuiz, Question, QuizAttempt, Story } from "../models";

type OptionId = "A" | "B" | "C" | "D";

const publicQuestion = (snapshot: {
	questionId: string;
	prompt: string;
	options: { id: OptionId; text: string }[];
	sourceStoryId: string;
}) => ({
	questionId: snapshot.questionId,
	prompt: snapshot.prompt,
	options: snapshot.options,
	sourceStoryId: snapshot.sourceStoryId,
});

const answeredFeedback = (snapshot: {
	questionId: string;
	prompt: string;
	options: { id: OptionId; text: string }[];
	correctOptionId: OptionId;
	explanation: string;
	sourceStoryId: string;
}, answer: { selectedOptionId: OptionId; isCorrect: boolean; answeredAt: Date; clientRequestId: string }) => ({
	...publicQuestion(snapshot),
	selectedOptionId: answer.selectedOptionId,
	isCorrect: answer.isCorrect,
	correctOptionId: snapshot.correctOptionId,
	explanation: snapshot.explanation,
	answeredAt: answer.answeredAt.toISOString(),
	clientRequestId: answer.clientRequestId,
});

const mapAttemptView = (attempt: {
	id: string;
	dailyQuizId: string;
	status: "in_progress" | "completed";
	score?: number | null;
	nextQuestionIndex: number;
	revision: number;
	startedAt: Date;
	completedAt?: Date | null;
	questionSnapshots: Array<{
		questionId: string;
		prompt: string;
		options: { id: OptionId; text: string }[];
		correctOptionId: OptionId;
		explanation: string;
		sourceStoryId: string;
	}>;
	answers: Array<{
		questionId: string;
		selectedOptionId: OptionId;
		isCorrect: boolean;
		answeredAt: Date;
		clientRequestId: string;
	}>;
}) => {
	const confirmed = attempt.answers.map((answer, index) =>
		answeredFeedback(attempt.questionSnapshots[index], answer),
	);

	const currentSnapshot =
		attempt.status === "in_progress" && attempt.nextQuestionIndex < attempt.questionSnapshots.length
			? publicQuestion(attempt.questionSnapshots[attempt.nextQuestionIndex])
			: null;

	return {
		id: attempt.id,
		dailyQuizId: attempt.dailyQuizId,
		status: attempt.status,
		score: attempt.score ?? null,
		nextQuestionIndex: attempt.nextQuestionIndex,
		revision: attempt.revision,
		startedAt: attempt.startedAt.toISOString(),
		completedAt: attempt.completedAt ? attempt.completedAt.toISOString() : null,
		confirmedAnswers: confirmed,
		currentQuestion: currentSnapshot,
	};
};

export const createOrGetQuizAttempt = async (deviceId: string, quizId: string, now: Date = new Date()) => {
	const quiz = await DailyQuiz.findOne({ id: quizId, status: "approved" }).lean().exec();
	if (!quiz || !quiz.publishAt || new Date(quiz.publishAt).getTime() > now.getTime()) {
		return { status: "unavailable" as const };
	}

	const story = await Story.findOne({ id: quiz.storyId, status: "approved" }).lean().exec();
	if (!story || !story.publishAt || new Date(story.publishAt).getTime() > now.getTime()) {
		return { status: "unavailable" as const };
	}

	const existing = await QuizAttempt.findOne({ deviceId, dailyQuizId: quizId }).exec();
	if (existing) {
		return { status: "ok" as const, created: false, attempt: mapAttemptView(existing) };
	}

	const questions = await Question.find({ id: { $in: quiz.questionIds } })
		.select("+correctOptionId +explanation")
		.lean()
		.exec();
	const byId = new Map(questions.map((question) => [question.id, question]));
	const snapshots = quiz.questionIds.map((questionId) => {
		const question = byId.get(questionId);
		if (!question) {
			throw new Error(`Missing question ${questionId}`);
		}
		return {
			questionId: question.id,
			questionVersion: question.version,
			sourceStoryId: question.sourceStoryId,
			prompt: question.prompt,
			options: question.options as { id: OptionId; text: string }[],
			correctOptionId: question.correctOptionId as OptionId,
			explanation: question.explanation,
			sourceIds: question.sourceIds,
		};
	});

	const created = await QuizAttempt.create({
		id: randomUUID(),
		deviceId,
		dailyQuizId: quiz.id,
		quizVersion: quiz.version,
		status: "in_progress",
		startedAt: now,
		nextQuestionIndex: 0,
		revision: 0,
		questionSnapshots: snapshots,
		answers: [],
	});

	return { status: "ok" as const, created: true, attempt: mapAttemptView(created) };
};

export const getQuizAttemptForDevice = async (deviceId: string, attemptId: string) => {
	const attempt = await QuizAttempt.findOne({ id: attemptId, deviceId }).exec();
	if (!attempt) {
		return null;
	}
	return mapAttemptView(attempt);
};

export const submitQuizAnswer = async (input: {
	deviceId: string;
	attemptId: string;
	questionId: string;
	selectedOptionId: OptionId;
	clientRequestId: string;
	expectedRevision: number;
	now?: Date;
}) => {
	const now = input.now ?? new Date();
	const attempt = await QuizAttempt.findOne({ id: input.attemptId, deviceId: input.deviceId }).exec();
	if (!attempt) {
		return { status: "not_found" as const };
	}

	const existingAnswer = attempt.answers.find((answer) => answer.clientRequestId === input.clientRequestId);
	if (existingAnswer) {
		const index = attempt.answers.findIndex((answer) => answer.clientRequestId === input.clientRequestId);
		const snapshot = attempt.questionSnapshots[index];
		return {
			status: "ok" as const,
			idempotent: true,
			feedback: answeredFeedback(snapshot, existingAnswer),
			attempt: mapAttemptView(attempt),
		};
	}

	if (attempt.status === "completed") {
		const locked = attempt.answers.find((answer) => answer.questionId === input.questionId);
		if (locked) {
			return { status: "locked" as const };
		}
		return { status: "locked" as const };
	}

	const expectedIndex = attempt.nextQuestionIndex;
	const expectedSnapshot = attempt.questionSnapshots[expectedIndex];
	if (!expectedSnapshot || expectedSnapshot.questionId !== input.questionId) {
		const already = attempt.answers.find((answer) => answer.questionId === input.questionId);
		if (already) {
			if (already.selectedOptionId === input.selectedOptionId) {
				const index = attempt.answers.findIndex((answer) => answer.questionId === input.questionId);
				return {
					status: "ok" as const,
					idempotent: true,
					feedback: answeredFeedback(attempt.questionSnapshots[index], already),
					attempt: mapAttemptView(attempt),
				};
			}
			return { status: "locked" as const };
		}
		return { status: "revision" as const };
	}

	if (attempt.revision !== input.expectedRevision) {
		return { status: "revision" as const };
	}

	const isCorrect = expectedSnapshot.correctOptionId === input.selectedOptionId;
	const answer = {
		questionId: input.questionId,
		selectedOptionId: input.selectedOptionId,
		isCorrect,
		answeredAt: now,
		clientRequestId: input.clientRequestId,
	};

	const nextIndex = expectedIndex + 1;
	const nextAnswers = [...attempt.answers, answer];
	const completed = nextIndex >= attempt.questionSnapshots.length;
	const score = completed ? nextAnswers.filter((item) => item.isCorrect).length : null;

	const updated = await QuizAttempt.findOneAndUpdate(
		{
			_id: attempt._id,
			deviceId: input.deviceId,
			status: "in_progress",
			nextQuestionIndex: expectedIndex,
			revision: input.expectedRevision,
		},
		{
			$set: {
				answers: nextAnswers,
				nextQuestionIndex: nextIndex,
				revision: input.expectedRevision + 1,
				...(completed
					? {
							status: "completed",
							completedAt: now,
							score,
						}
					: {}),
			},
		},
		{ new: true },
	).exec();

	if (!updated) {
		const raced = await QuizAttempt.findOne({ id: input.attemptId, deviceId: input.deviceId }).exec();
		if (!raced) {
			return { status: "not_found" as const };
		}
		const same = raced.answers.find((item) => item.clientRequestId === input.clientRequestId);
		if (same) {
			const index = raced.answers.findIndex((item) => item.clientRequestId === input.clientRequestId);
			return {
				status: "ok" as const,
				idempotent: true,
				feedback: answeredFeedback(raced.questionSnapshots[index], same),
				attempt: mapAttemptView(raced),
			};
		}
		const locked = raced.answers.find((item) => item.questionId === input.questionId);
		if (locked && locked.selectedOptionId !== input.selectedOptionId) {
			return { status: "locked" as const };
		}
		return { status: "revision" as const };
	}

	return {
		status: "ok" as const,
		idempotent: false,
		feedback: answeredFeedback(expectedSnapshot, answer),
		attempt: mapAttemptView(updated),
	};
};

export const getQuizAttemptResult = async (deviceId: string, attemptId: string) => {
	const attempt = await QuizAttempt.findOne({ id: attemptId, deviceId }).exec();
	if (!attempt) {
		return { status: "not_found" as const };
	}
	if (attempt.status !== "completed") {
		return { status: "not_complete" as const };
	}
	return {
		status: "ok" as const,
		result: {
			id: attempt.id,
			dailyQuizId: attempt.dailyQuizId,
			score: attempt.score ?? 0,
			completedAt: attempt.completedAt?.toISOString() ?? null,
			answers: attempt.answers.map((answer, index) =>
				answeredFeedback(attempt.questionSnapshots[index], answer),
			),
		},
	};
};

export const listQuizResults = async (deviceId: string, options: { limit: number; cursor?: string }) => {
	const limit = Math.min(Math.max(options.limit, 1), 50);
	const filter: Record<string, unknown> = {
		deviceId,
		status: "completed",
	};

	if (options.cursor) {
		const completedAt = new Date(options.cursor);
		if (!Number.isNaN(completedAt.getTime())) {
			filter.completedAt = { $lt: completedAt };
		}
	}

	const rows = await QuizAttempt.find(filter)
		.sort({ completedAt: -1, id: -1 })
		.limit(limit + 1)
		.lean()
		.exec();
	const page = rows.slice(0, limit);
	const next = rows.length > limit ? page[page.length - 1] : null;

	const completed = await QuizAttempt.find({ deviceId, status: "completed" }).select("score").lean().exec();
	const totalScore = completed.reduce((sum, row) => sum + (row.score ?? 0), 0);
	const average = completed.length > 0 ? totalScore / completed.length : null;

	return {
		items: page.map((row) => ({
			id: row.id,
			dailyQuizId: row.dailyQuizId,
			score: row.score ?? 0,
			completedAt: row.completedAt ? row.completedAt.toISOString() : null,
		})),
		nextCursor: next?.completedAt ? new Date(next.completedAt).toISOString() : null,
		aggregates: {
			completedCount: completed.length,
			totalScore,
			averageScore: average,
		},
	};
};
