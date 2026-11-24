import type { Request, Response } from "express";

import { getClockSnapshot } from "../service";

export const getTime = (_req: Request, res: Response): void => {
	res.setHeader("Cache-Control", "no-store");
	res.status(200).json(getClockSnapshot());
};
