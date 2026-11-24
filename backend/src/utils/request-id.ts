import { randomUUID } from "node:crypto";

import type { Request } from "express";

export const getRequestId = (req: Request): string => {
	const header = req.header("x-request-id")?.trim();
	return header && header.length > 0 ? header : randomUUID();
};
