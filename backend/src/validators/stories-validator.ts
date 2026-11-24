import { param, query } from "express-validator";

export const storiesValidator = {
	list: [
		query("limit").optional().isInt({ min: 1, max: 50 }),
		query("cursor").optional().isString().isLength({ min: 1, max: 512 }),
	],
	byId: [param("id").isString().isLength({ min: 1, max: 32 })],
};
