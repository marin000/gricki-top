import { body, param, query } from "express-validator";

export const quizAttemptsValidator = {
	create: [param("id").isString().matches(/^D\d{3}$/)],
	byId: [param("id").isUUID()],
	answer: [
		param("id").isUUID(),
		body("questionId").isString().matches(/^Q\d{3}$/),
		body("selectedOptionId").isIn(["A", "B", "C", "D"]),
		body("clientRequestId").isString().isLength({ min: 8, max: 128 }),
		body("expectedRevision").isInt({ min: 0, max: 5 }),
	],
	results: [
		query("type").optional().isIn(["quiz", "timing"]),
		query("limit").optional().isInt({ min: 1, max: 50 }),
		query("cursor").optional().isString().isLength({ min: 1, max: 128 }),
	],
};
