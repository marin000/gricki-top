import { bootstrapSchema, type Bootstrap } from "@/interface";
import type { DeviceIdentity } from "@/utils/device-identity";

import { apiRequest } from "./client";

export const fetchBootstrap = async (identity: DeviceIdentity): Promise<Bootstrap> => {
	const payload = await apiRequest<unknown>("/v1/bootstrap", { identity });
	return bootstrapSchema.parse(payload);
};
