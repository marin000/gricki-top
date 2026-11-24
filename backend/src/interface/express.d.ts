import type { Types } from "mongoose";

declare global {
	namespace Express {
		interface Request {
			requestId?: string;
			deviceId?: string;
			deviceObjectId?: Types.ObjectId;
		}
	}
}

export {};
