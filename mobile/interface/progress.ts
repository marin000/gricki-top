import { z } from "zod";

import { deviceSettingsSchema } from "./bootstrap";

export const progressSchema = z.object({
	settings: deviceSettingsSchema.nullable(),
	stories: z.array(
		z.object({
			storyId: z.string(),
			readAt: z.string().nullable(),
			promptDismissedAt: z.string().nullable(),
		}),
	),
	quizzes: z.array(
		z.object({
			dailyQuizId: z.string(),
			dayNumber: z.number(),
			attemptStatus: z.enum(["none", "in_progress", "completed"]),
			score: z.number().nullable(),
		}),
	),
});

export const quizMetadataSchema = z.object({
	id: z.string(),
	dayNumber: z.number(),
	storyId: z.string(),
	storyTitle: z.string(),
	questionCount: z.number(),
	publishAt: z.string(),
	version: z.number(),
	attempt: z
		.object({
			id: z.string(),
			status: z.enum(["in_progress", "completed"]),
			score: z.number().nullable(),
			nextQuestionIndex: z.number(),
			startedAt: z.string(),
			completedAt: z.string().nullable(),
		})
		.nullable(),
});

export type Progress = z.infer<typeof progressSchema>;
export type QuizMetadata = z.infer<typeof quizMetadataSchema>;
