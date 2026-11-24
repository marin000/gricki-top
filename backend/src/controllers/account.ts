import type { Request, Response } from "express";

import { errorCodes, errorMessages } from "../constants";
import { deleteDeviceAccount } from "../service";
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

/** Idempotent account wipe: missing device → 204; bad token → 401; success → 204. */
export const deleteMe = async (req: Request, res: Response): Promise<void> => {
	const requestId = req.requestId ?? "unknown";
	res.setHeader("Cache-Control", "private, no-store");

	const credentials = parseBearer(req.header("authorization"));
	if (!credentials) {
		sendApiError(
			res,
			401,
			errorCodes.INSTALLATION_UNAUTHORIZED,
			errorMessages.unauthorized,
			requestId,
		);
		return;
	}

	const result = await deleteDeviceAccount(credentials.deviceId, credentials.token);
	if (result === "unauthorized") {
		sendApiError(
			res,
			401,
			errorCodes.INSTALLATION_UNAUTHORIZED,
			errorMessages.unauthorized,
			requestId,
		);
		return;
	}

	res.status(204).send();
};
