import type { Request, Response } from "express";

import { errorCodes, errorMessages } from "../constants";
import { getDeviceProgress, patchDeviceSettings, upsertStoryProgress } from "../service";
import { sendApiError } from "../utils";

export const putStoryProgress = async (req: Request, res: Response): Promise<void> => {
	const requestId = req.requestId ?? "unknown";
	res.setHeader("Cache-Control", "private, no-store");

	const deviceId = req.deviceId;
	if (!deviceId) {
		sendApiError(res, 401, errorCodes.INSTALLATION_UNAUTHORIZED, errorMessages.unauthorized, requestId);
		return;
	}

	const { markRead, dismissPrompt, clientUpdatedAt } = req.body as {
		markRead?: boolean;
		dismissPrompt?: boolean;
		clientUpdatedAt?: string;
		clientRequestId?: string;
	};

	const result = await upsertStoryProgress({
		deviceId,
		storyId: req.params.storyId as string,
		markRead: markRead === true,
		dismissPrompt: dismissPrompt === true,
		clientUpdatedAt: clientUpdatedAt ? new Date(clientUpdatedAt) : undefined,
	});

	if (result.status === "unavailable") {
		sendApiError(res, 404, errorCodes.CONTENT_NOT_AVAILABLE, errorMessages.contentNotAvailable, requestId);
		return;
	}

	res.status(200).json(result);
};

export const getProgress = async (req: Request, res: Response): Promise<void> => {
	const requestId = req.requestId ?? "unknown";
	res.setHeader("Cache-Control", "private, no-store");

	const deviceId = req.deviceId;
	if (!deviceId) {
		sendApiError(res, 401, errorCodes.INSTALLATION_UNAUTHORIZED, errorMessages.unauthorized, requestId);
		return;
	}

	const payload = await getDeviceProgress(deviceId);
	res.status(200).json(payload);
};

export const patchSettings = async (req: Request, res: Response): Promise<void> => {
	const requestId = req.requestId ?? "unknown";
	res.setHeader("Cache-Control", "private, no-store");

	const deviceId = req.deviceId;
	if (!deviceId) {
		sendApiError(res, 401, errorCodes.INSTALLATION_UNAUTHORIZED, errorMessages.unauthorized, requestId);
		return;
	}

	const settings = await patchDeviceSettings(deviceId, req.body);
	if (!settings) {
		sendApiError(res, 401, errorCodes.INSTALLATION_UNAUTHORIZED, errorMessages.unauthorized, requestId);
		return;
	}

	res.status(200).json({ settings });
};
