import type { Request, Response } from "express";

import { errorCodes, errorMessages } from "../constants";
import { getMainStory, getStoryById, listPublishedStories } from "../service";
import { sendApiError } from "../utils";

export const getStories = async (
	req: Request,
	res: Response,
): Promise<void> => {
	const requestId = req.requestId ?? "unknown";
	res.setHeader("Cache-Control", "private, no-store");

	const deviceId = req.deviceId;
	if (!deviceId) {
		sendApiError(
			res,
			401,
			errorCodes.INSTALLATION_UNAUTHORIZED,
			errorMessages.unauthorized,
			requestId,
		);
		return;
	}

	const limit = Number(req.query.limit ?? 20);
	const cursor =
		typeof req.query.cursor === "string" ? req.query.cursor : undefined;

	try {
		const payload = await listPublishedStories({
			deviceId,
			limit: Number.isFinite(limit) ? limit : 20,
			cursor,
		});
		res.status(200).json(payload);
	} catch (error) {
		if (error instanceof Error && error.message === "INVALID_CURSOR") {
			sendApiError(
				res,
				400,
				errorCodes.VALIDATION_ERROR,
				errorMessages.invalidBody,
				requestId,
			);
			return;
		}
		throw error;
	}
};

export const getStoryMain = async (
	_req: Request,
	res: Response,
): Promise<void> => {
	res.setHeader("Cache-Control", "private, no-store");
	const story = await getMainStory();
	if (!story) {
		sendApiError(
			res,
			404,
			errorCodes.CONTENT_NOT_AVAILABLE,
			errorMessages.contentNotAvailable,
			_req.requestId ?? "unknown",
		);
		return;
	}
	res.status(200).json(story);
};

export const getStory = async (req: Request, res: Response): Promise<void> => {
	const requestId = req.requestId ?? "unknown";
	res.setHeader("Cache-Control", "private, no-store");

	const deviceId = req.deviceId;
	if (!deviceId) {
		sendApiError(
			res,
			401,
			errorCodes.INSTALLATION_UNAUTHORIZED,
			errorMessages.unauthorized,
			requestId,
		);
		return;
	}

	const story = await getStoryById(req.params.id as string, deviceId);
	if (!story) {
		sendApiError(
			res,
			404,
			errorCodes.CONTENT_NOT_AVAILABLE,
			errorMessages.contentNotAvailable,
			requestId,
		);
		return;
	}

	res.status(200).json(story);
};
