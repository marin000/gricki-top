import type { Request, Response } from "express";
import type { DeviceSettings } from "../interface";
import { Device } from "../models";
import { buildBootstrap } from "../service";

export const getBootstrap = async (
	req: Request,
	res: Response,
): Promise<void> => {
	res.setHeader("Cache-Control", "private, no-store");

	let settings: DeviceSettings | undefined;
	if (req.deviceId) {
		const device = await Device.findOne({ deviceId: req.deviceId })
			.lean()
			.exec();
		settings = device?.settings as DeviceSettings | undefined;
	}

	const payload = await buildBootstrap(settings);
	res.status(200).json(payload);
};
