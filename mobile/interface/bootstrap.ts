import { z } from "zod";

export const deviceSettingsSchema = z.object({
	soundEnabled: z.boolean(),
	hapticsEnabled: z.boolean(),
	reminderEnabled: z.boolean(),
	reminderLeadMinutes: z.number(),
});

export const bootstrapSchema = z.object({
	serverNow: z.string(),
	timezone: z.string(),
	todayLocalDate: z.string(),
	todayNoonAt: z.string(),
	nextNoonAt: z.string(),
	contentStartDate: z.string().nullable(),
	contentPackVersion: z.string().nullable(),
	latestPublishedDay: z.number(),
	latestPublishedContent: z
		.object({
			storyId: z.string(),
			dayNumber: z.number().nullable(),
			title: z.string(),
			lead: z.string(),
			category: z.string(),
		})
		.nullable(),
	mainStoryVersion: z.number().nullable(),
	settings: deviceSettingsSchema.nullable(),
});

export type Bootstrap = z.infer<typeof bootstrapSchema>;
export type DeviceSettings = z.infer<typeof deviceSettingsSchema>;
