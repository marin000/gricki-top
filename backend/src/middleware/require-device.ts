import type { NextFunction, Request, Response } from "express";

import { errorCodes, errorMessages } from "../constants";
import { findDeviceByCredentials, touchDeviceDaily } from "../service";
import { sendApiError } from "../utils";

const parseBearer = (header: string | undefined): { deviceId: string; token: string } | null => {
	if (!header?.startsWith("Bearer ")) {
		return null;
	}
	const raw = header.slice("Bearer ".length).trim();
	const separator = raw.indexOf(".");
	if (separator <= 0 || separator === raw.length - 1) {
		return null;
	}
	return {
		deviceId: raw.slice(0, separator),
		token: raw.slice(separator + 1),
	};
};

export const requireDevice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	const requestId = req.requestId ?? "unknown";
	const credentials = parseBearer(req.header("authorization"));
	if (!credentials) {
		sendApiError(res, 401, errorCodes.INSTALLATION_UNAUTHORIZED, errorMessages.unauthorized, requestId);
		return;
	}

	const device = await findDeviceByCredentials(credentials.deviceId, credentials.token);
	if (!device) {
		sendApiError(res, 401, errorCodes.INSTALLATION_UNAUTHORIZED, errorMessages.unauthorized, requestId);
		return;
	}

	await touchDeviceDaily(device.deviceId);
	req.deviceId = device.deviceId;
	req.deviceObjectId = device._id;
	next();
};
