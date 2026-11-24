import type { Request, Response } from "express";

import { errorCodes, errorMessages } from "../constants";
import { getQuizMetadata } from "../service";
import { sendApiError } from "../utils";

export const getQuiz = async (req: Request, res: Response): Promise<void> => {
	const requestId = req.requestId ?? "unknown";
	res.setHeader("Cache-Control", "private, no-store");

	const deviceId = req.deviceId;
	if (!deviceId) {
		sendApiError(res, 401, errorCodes.INSTALLATION_UNAUTHORIZED, errorMessages.unauthorized, requestId);
		return;
	}

	const quiz = await getQuizMetadata(req.params.id as string, deviceId);
	if (!quiz) {
		sendApiError(res, 404, errorCodes.CONTENT_NOT_AVAILABLE, errorMessages.contentNotAvailable, requestId);
		return;
	}

	res.status(200).json(quiz);
};
