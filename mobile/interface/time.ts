import { z } from "zod";

export const clockSnapshotSchema = z.object({
	serverNow: z.string(),
	timezone: z.string(),
	todayLocalDate: z.string(),
	todayNoonAt: z.string(),
	nextNoonAt: z.string(),
});

export type ClockSnapshot = z.infer<typeof clockSnapshotSchema>;
