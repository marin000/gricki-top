import { Device } from "../models";
import type { DevicePlatform, DeviceSettings } from "../interface";
import { hashToken, tokensEqual } from "../utils";

const defaultSettings = (): DeviceSettings => ({
	soundEnabled: true,
	hapticsEnabled: true,
	reminderEnabled: false,
	reminderLeadMinutes: 1,
});

export type RegisterResult =
	| { status: "created" | "existing"; deviceId: string; settings: DeviceSettings }
	| { status: "conflict" };

export const registerDevice = async (input: {
	deviceId: string;
	token: string;
	platform: DevicePlatform;
	appVersion: string;
	locale: string;
}): Promise<RegisterResult> => {
	const tokenHash = hashToken(input.token);
	const existing = await Device.findOne({ deviceId: input.deviceId }).select("+tokenHash").exec();

	if (existing) {
		if (!tokensEqual(existing.tokenHash, tokenHash)) {
			return { status: "conflict" };
		}
		existing.platform = input.platform;
		existing.appVersion = input.appVersion;
		existing.locale = input.locale;
		existing.lastSeenAt = new Date();
		await existing.save();
		return {
			status: "existing",
			deviceId: existing.deviceId,
			settings: (existing.settings as DeviceSettings) ?? defaultSettings(),
		};
	}

	const created = await Device.create({
		deviceId: input.deviceId,
		tokenHash,
		platform: input.platform,
		appVersion: input.appVersion,
		locale: input.locale,
		settings: defaultSettings(),
		lastSeenAt: new Date(),
	});

	return {
		status: "created",
		deviceId: created.deviceId,
		settings: (created.settings as DeviceSettings) ?? defaultSettings(),
	};
};

export const findDeviceByCredentials = async (deviceId: string, token: string) => {
	const device = await Device.findOne({ deviceId }).select("+tokenHash").exec();
	if (!device) {
		return null;
	}
	if (!tokensEqual(device.tokenHash, hashToken(token))) {
		return null;
	}
	return device;
};

export const touchDeviceDaily = async (deviceId: string): Promise<void> => {
	const device = await Device.findOne({ deviceId }).exec();
	if (!device) {
		return;
	}
	const last = device.lastSeenAt ? new Date(device.lastSeenAt) : null;
	const now = new Date();
	if (!last || now.toDateString() !== last.toDateString()) {
		device.lastSeenAt = now;
		await device.save();
	}
};
