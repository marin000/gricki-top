import { body, param } from "express-validator";

export const progressValidator = {
	storyProgress: [
		param("storyId").isString().isLength({ min: 1, max: 32 }),
		body("markRead").optional().isBoolean(),
		body("dismissPrompt").optional().isBoolean(),
		body("clientRequestId")
			.optional()
			.isString()
			.isLength({ min: 1, max: 128 }),
		body("clientUpdatedAt").optional().isISO8601(),
		body().custom((_, { req }) => {
			const { markRead, dismissPrompt } = req.body as {
				markRead?: boolean;
				dismissPrompt?: boolean;
			};
			if (markRead !== true && dismissPrompt !== true) {
				throw new Error(
					"At least one of markRead or dismissPrompt must be true",
				);
			}
			return true;
		}),
	],
	settings: [
		body("soundEnabled").optional().isBoolean({ loose: true }),
		body("hapticsEnabled").optional().isBoolean({ loose: true }),
		body("reminderEnabled").optional().isBoolean({ loose: true }),
		body("reminderLeadMinutes").optional().isInt({ min: 1, max: 60 }),
		body().custom((value) => {
			const allowed = [
				"soundEnabled",
				"hapticsEnabled",
				"reminderEnabled",
				"reminderLeadMinutes",
			];
			const keys = Object.keys(value ?? {});
			if (keys.length === 0 || keys.some((key) => !allowed.includes(key))) {
				throw new Error("Invalid settings payload");
			}
			return true;
		}),
	],
};
