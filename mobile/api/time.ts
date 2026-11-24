import { type ClockSnapshot, clockSnapshotSchema } from "@/interface";

import { apiRequest } from "./client";

export const fetchServerTime = async (): Promise<ClockSnapshot> => {
	const payload = await apiRequest<unknown>("/v1/time", { omitAuth: true });
	return clockSnapshotSchema.parse(payload);
};
