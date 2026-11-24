import type { Request, Response } from "express";

import { errorCodes, errorMessages } from "../constants";
import { createTimingAttempt } from "../service";
import { sendApiError } from "../utils";

export const postTimingAttempt = async (req: Request, res: Response): Promise<void> => {
	const requestId = req.requestId ?? "unknown";
	res.setHeader("Cache-Control", "private, no-store");

	const deviceId = req.deviceId;
	if (!deviceId) {
		sendApiError(res, 401, errorCodes.INSTALLATION_UNAUTHORIZED, errorMessages.unauthorized, requestId);
		return;
	}

	const body = req.body as {
		localDate: string;
		clientAttemptId: string;
		estimatedTapAt: string;
		syncStatus: "synced" | "unverified";
		clockRttMs?: number;
		appVersion: string;
	};

	const result = await createTimingAttempt({
		deviceId,
		localDate: body.localDate,
		clientAttemptId: body.clientAttemptId,
		estimatedTapAt: body.estimatedTapAt,
		syncStatus: body.syncStatus,
		clockRttMs: body.clockRttMs,
		appVersion: body.appVersion,
	});

	if (result.status === "invalid") {
		sendApiError(res, 400, errorCodes.VALIDATION_ERROR, errorMessages.invalidBody, requestId);
		return;
	}
	if (result.status === "conflict") {
		sendApiError(res, 409, errorCodes.TIMING_ALREADY_RECORDED, errorMessages.timingAlreadyRecorded, requestId, {
			attempt: result.attempt,
		});
		return;
	}

	res.status(result.created ? 201 : 200).json(result.attempt);
};
