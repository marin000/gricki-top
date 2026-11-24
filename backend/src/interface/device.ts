export type DevicePlatform = "ios" | "android";

export type DeviceSettings = {
	soundEnabled: boolean;
	hapticsEnabled: boolean;
	reminderEnabled: boolean;
	reminderLeadMinutes: number;
};

export type RegisterDeviceBody = {
	deviceId: string;
	token: string;
	platform: DevicePlatform;
	appVersion: string;
	locale: string;
};
