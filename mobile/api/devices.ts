import { Platform } from "react-native";

import type { DeviceSettings } from "@/interface";
import type { DeviceIdentity } from "@/utils";

import { apiRequest } from "./client";

type RegisterResponse = {
	deviceId: string;
	settings: DeviceSettings;
};

export const registerDevice = async (identity: DeviceIdentity, appVersion: string): Promise<RegisterResponse> => {
	return apiRequest<RegisterResponse>("/v1/devices/register", {
		method: "POST",
		omitAuth: true,
		body: {
			deviceId: identity.deviceId,
			token: identity.token,
			platform: Platform.OS === "ios" ? "ios" : "android",
			appVersion,
			locale: "hr-HR",
		},
	});
};
