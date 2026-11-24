import { z } from "zod";

const optionSchema = z.object({
	id: z.enum(["A", "B", "C", "D"]),
	text: z.string(),
});

export const quizQuestionSchema = z.object({
	questionId: z.string(),
	prompt: z.string(),
	options: z.array(optionSchema).length(4),
	sourceStoryId: z.string(),
});

export const quizAnswerFeedbackSchema = quizQuestionSchema.extend({
	selectedOptionId: z.enum(["A", "B", "C", "D"]),
	isCorrect: z.boolean(),
	correctOptionId: z.enum(["A", "B", "C", "D"]),
	explanation: z.string(),
	answeredAt: z.string(),
	clientRequestId: z.string(),
});

export const quizAttemptSchema = z.object({
	id: z.string(),
	dailyQuizId: z.string(),
	status: z.enum(["in_progress", "completed"]),
	score: z.number().nullable(),
	nextQuestionIndex: z.number(),
	revision: z.number(),
	startedAt: z.string(),
	completedAt: z.string().nullable(),
	confirmedAnswers: z.array(quizAnswerFeedbackSchema),
	currentQuestion: quizQuestionSchema.nullable(),
});

export const quizAnswerResponseSchema = z.object({
	feedback: quizAnswerFeedbackSchema,
	attempt: quizAttemptSchema,
	idempotent: z.boolean(),
});

export const quizResultSchema = z.object({
	id: z.string(),
	dailyQuizId: z.string(),
	score: z.number(),
	completedAt: z.string().nullable(),
	answers: z.array(quizAnswerFeedbackSchema),
});

export const quizResultsListSchema = z.object({
	items: z.array(
		z.object({
			id: z.string(),
			dailyQuizId: z.string(),
			score: z.number(),
			completedAt: z.string().nullable(),
		}),
	),
	nextCursor: z.string().nullable(),
	aggregates: z.object({
		completedCount: z.number(),
		totalScore: z.number(),
		averageScore: z.number().nullable(),
	}),
});

export type QuizAttempt = z.infer<typeof quizAttemptSchema>;
export type QuizResult = z.infer<typeof quizResultSchema>;
export type QuizResultsList = z.infer<typeof quizResultsListSchema>;
