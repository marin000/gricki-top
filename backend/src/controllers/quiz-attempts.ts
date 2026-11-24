import type { Request, Response } from "express";

import { errorCodes, errorMessages } from "../constants";
import {
	createOrGetQuizAttempt,
	getQuizAttemptForDevice,
	getQuizAttemptResult,
	listQuizResults,
	submitQuizAnswer,
} from "../service";
import { sendApiError } from "../utils";

export const postQuizAttempt = async (req: Request, res: Response): Promise<void> => {
	const requestId = req.requestId ?? "unknown";
	res.setHeader("Cache-Control", "private, no-store");
	const deviceId = req.deviceId;
	if (!deviceId) {
		sendApiError(res, 401, errorCodes.INSTALLATION_UNAUTHORIZED, errorMessages.unauthorized, requestId);
		return;
	}

	const result = await createOrGetQuizAttempt(deviceId, req.params.id as string);
	if (result.status === "unavailable") {
		sendApiError(res, 404, errorCodes.CONTENT_NOT_AVAILABLE, errorMessages.contentNotAvailable, requestId);
		return;
	}

	res.status(result.created ? 201 : 200).json(result.attempt);
};

export const getQuizAttempt = async (req: Request, res: Response): Promise<void> => {
	const requestId = req.requestId ?? "unknown";
	res.setHeader("Cache-Control", "private, no-store");
	const deviceId = req.deviceId;
	if (!deviceId) {
		sendApiError(res, 401, errorCodes.INSTALLATION_UNAUTHORIZED, errorMessages.unauthorized, requestId);
		return;
	}

	const attempt = await getQuizAttemptForDevice(deviceId, req.params.id as string);
	if (!attempt) {
		sendApiError(res, 404, errorCodes.NOT_FOUND, errorMessages.notFound, requestId);
		return;
	}
	res.status(200).json(attempt);
};

export const postQuizAnswer = async (req: Request, res: Response): Promise<void> => {
	const requestId = req.requestId ?? "unknown";
	res.setHeader("Cache-Control", "private, no-store");
	const deviceId = req.deviceId;
	if (!deviceId) {
		sendApiError(res, 401, errorCodes.INSTALLATION_UNAUTHORIZED, errorMessages.unauthorized, requestId);
		return;
	}

	const { questionId, selectedOptionId, clientRequestId, expectedRevision } = req.body as {
		questionId: string;
		selectedOptionId: "A" | "B" | "C" | "D";
		clientRequestId: string;
		expectedRevision: number;
	};

	const result = await submitQuizAnswer({
		deviceId,
		attemptId: req.params.id as string,
		questionId,
		selectedOptionId,
		clientRequestId,
		expectedRevision,
	});

	if (result.status === "not_found") {
		sendApiError(res, 404, errorCodes.NOT_FOUND, errorMessages.notFound, requestId);
		return;
	}
	if (result.status === "locked") {
		sendApiError(res, 409, errorCodes.ANSWER_ALREADY_LOCKED, errorMessages.answerAlreadyLocked, requestId);
		return;
	}
	if (result.status === "revision") {
		sendApiError(res, 409, errorCodes.REVISION_CONFLICT, errorMessages.revisionConflict, requestId);
		return;
	}

	res.status(200).json({
		feedback: result.feedback,
		attempt: result.attempt,
		idempotent: result.idempotent,
	});
};

export const getQuizAttemptResultHandler = async (req: Request, res: Response): Promise<void> => {
	const requestId = req.requestId ?? "unknown";
	res.setHeader("Cache-Control", "private, no-store");
	const deviceId = req.deviceId;
	if (!deviceId) {
		sendApiError(res, 401, errorCodes.INSTALLATION_UNAUTHORIZED, errorMessages.unauthorized, requestId);
		return;
	}

	const result = await getQuizAttemptResult(deviceId, req.params.id as string);
	if (result.status === "not_found") {
		sendApiError(res, 404, errorCodes.NOT_FOUND, errorMessages.notFound, requestId);
		return;
	}
	if (result.status === "not_complete") {
		sendApiError(res, 409, errorCodes.ATTEMPT_NOT_COMPLETE, errorMessages.attemptNotComplete, requestId);
		return;
	}

	res.status(200).json(result.result);
};

export const getResults = async (req: Request, res: Response): Promise<void> => {
	const requestId = req.requestId ?? "unknown";
	res.setHeader("Cache-Control", "private, no-store");
	const deviceId = req.deviceId;
	if (!deviceId) {
		sendApiError(res, 401, errorCodes.INSTALLATION_UNAUTHORIZED, errorMessages.unauthorized, requestId);
		return;
	}

	const type = typeof req.query.type === "string" ? req.query.type : "quiz";
	if (type !== "quiz") {
		res.status(200).json({ items: [], nextCursor: null, aggregates: { completedCount: 0, totalScore: 0, averageScore: null } });
		return;
	}

	const limit = Number(req.query.limit ?? 20);
	const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined;
	const payload = await listQuizResults(deviceId, {
		limit: Number.isFinite(limit) ? limit : 20,
		cursor,
	});
	res.status(200).json(payload);
};
