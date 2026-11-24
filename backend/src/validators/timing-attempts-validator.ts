import { body } from "express-validator";

export const timingAttemptsValidator = {
	create: [
		body("localDate")
			.isString()
			.matches(/^\d{4}-\d{2}-\d{2}$/),
		body("clientAttemptId").isUUID(),
		body("estimatedTapAt").isISO8601(),
		body("syncStatus").isIn(["synced", "unverified"]),
		body("clockRttMs").optional().isFloat({ min: 0, max: 60_000 }),
		body("appVersion").isString().isLength({ min: 1, max: 32 }),
	],
};
