import { z } from "zod";

export const storySourceSchema = z.object({
	id: z.string(),
	title: z.string(),
	publisher: z.string(),
	url: z.string(),
	checkedAt: z.string(),
});

export const storySummarySchema = z.object({
	id: z.string(),
	dayNumber: z.number().nullable(),
	isMain: z.boolean(),
	title: z.string(),
	lead: z.string(),
	category: z.string(),
	publishAt: z.string().nullable(),
	version: z.number(),
});

export const storyDetailSchema = storySummarySchema.extend({
	paragraphs: z.array(z.string()),
	sourceIds: z.array(z.string()),
	sources: z.array(storySourceSchema),
	readAt: z.string().nullable().optional(),
	promptDismissedAt: z.string().nullable().optional(),
	quiz: z
		.object({
			dailyQuizId: z.string(),
			attemptStatus: z.enum(["none", "in_progress", "completed"]),
			score: z.number().nullable(),
		})
		.nullable()
		.optional(),
});

export const storiesListSchema = z.object({
	items: z.array(storySummarySchema),
	nextCursor: z.string().nullable(),
});

export type StorySummary = z.infer<typeof storySummarySchema>;
export type StoryDetail = z.infer<typeof storyDetailSchema>;
