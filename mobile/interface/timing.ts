import { z } from "zod";

export const timingAttemptSchema = z.object({
	id: z.string(),
	localDate: z.string(),
	clientAttemptId: z.string(),
	noonAt: z.string(),
	estimatedTapAt: z.string(),
	deltaMs: z.number(),
	syncStatus: z.enum(["synced", "unverified"]),
	clockRttMs: z.number().nullable(),
	recordedAt: z.string(),
	label: z.string(),
});

export const timingResultsListSchema = z.object({
	items: z.array(timingAttemptSchema),
	nextCursor: z.string().nullable(),
	aggregates: z.object({
		attemptCount: z.number(),
		bestAbsDeltaMs: z.number().nullable(),
	}),
});

export type TimingAttempt = z.infer<typeof timingAttemptSchema>;
export type TimingResultsList = z.infer<typeof timingResultsListSchema>;
