import type { Request, Response } from "express";

import { config } from "../config";

export const getHealth = (_req: Request, res: Response): void => {
	res.status(200).json({
		status: "ok",
		version: config.version,
	});
};
