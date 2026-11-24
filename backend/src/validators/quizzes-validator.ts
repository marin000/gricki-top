import { param } from "express-validator";

export const quizzesValidator = {
	byId: [param("id").isString().matches(/^D\d{3}$/)],
};
