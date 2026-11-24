import type { Request } from "express";

export const getClientIp = (req: Request): string => {
	const forwarded = req.header("x-forwarded-for")?.split(",")[0]?.trim();
	if (forwarded) {
		return forwarded;
	}
	return req.ip || req.socket.remoteAddress || "unknown";
};
