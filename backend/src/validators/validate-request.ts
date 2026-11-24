import type { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

import { errorCodes, errorMessages } from "../constants";
import { sendApiError } from "../utils";

export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		sendApiError(
			res,
			400,
			errorCodes.VALIDATION_ERROR,
			errorMessages.invalidBody,
			req.requestId ?? "unknown",
			errors.array(),
		);
		return;
	}
	next();
};
