import type { NextFunction, Request, Response } from "express";

import { errorCodes, errorMessages } from "../constants";
import { consumeAnswerLimit, consumeReadLimit, consumeRegisterLimit } from "../service";
import { getClientIp, sendApiError } from "../utils";

export const rateLimitRegister = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	const requestId = req.requestId ?? "unknown";
	const result = await consumeRegisterLimit(getClientIp(req));
	if (!result.allowed) {
		res.setHeader("Retry-After", String(result.retryAfterSec));
		sendApiError(res, 429, errorCodes.RATE_LIMITED, errorMessages.rateLimited, requestId);
		return;
	}
	next();
};

export const rateLimitRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	const requestId = req.requestId ?? "unknown";
	const deviceId = req.deviceId;
	if (!deviceId) {
		sendApiError(res, 401, errorCodes.INSTALLATION_UNAUTHORIZED, errorMessages.unauthorized, requestId);
		return;
	}

	const result = await consumeReadLimit(deviceId);
	if (!result.allowed) {
		res.setHeader("Retry-After", String(result.retryAfterSec));
		sendApiError(res, 429, errorCodes.RATE_LIMITED, errorMessages.rateLimited, requestId);
		return;
	}
	next();
};

export const rateLimitAnswers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	const requestId = req.requestId ?? "unknown";
	const deviceId = req.deviceId;
	if (!deviceId) {
		sendApiError(res, 401, errorCodes.INSTALLATION_UNAUTHORIZED, errorMessages.unauthorized, requestId);
		return;
	}

	const result = await consumeAnswerLimit(deviceId);
	if (!result.allowed) {
		res.setHeader("Retry-After", String(result.retryAfterSec));
		sendApiError(res, 429, errorCodes.RATE_LIMITED, errorMessages.rateLimited, requestId);
		return;
	}
	next();
};
