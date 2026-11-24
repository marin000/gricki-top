import type { DeviceIdentity } from "@/utils/device-identity";

import { apiRequest } from "./client";

export const deleteMyAccount = async (identity: DeviceIdentity): Promise<void> => {
	await apiRequest<void>("/v1/me", {
		method: "DELETE",
		identity,
	});
};
