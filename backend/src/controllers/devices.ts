import type { Request, Response } from "express";

import { errorCodes, errorMessages } from "../constants";
import type { DevicePlatform } from "../interface";
import { registerDevice } from "../service";
import { sendApiError } from "../utils";

export const postDeviceRegister = async (
	req: Request,
	res: Response,
): Promise<void> => {
	const requestId = req.requestId ?? "unknown";
	const { deviceId, token, platform, appVersion, locale } = req.body as {
		deviceId: string;
		token: string;
		platform: DevicePlatform;
		appVersion: string;
		locale: string;
	};

	const result = await registerDevice({
		deviceId,
		token,
		platform,
		appVersion,
		locale,
	});
	if (result.status === "conflict") {
		sendApiError(
			res,
			409,
			errorCodes.DEVICE_SECRET_CONFLICT,
			errorMessages.deviceConflict,
			requestId,
		);
		return;
	}

	res.status(result.status === "created" ? 201 : 200).json({
		deviceId: result.deviceId,
		settings: result.settings,
	});
};
