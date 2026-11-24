import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

const DEVICE_ID_KEY = "gricki.deviceId";
const DEVICE_TOKEN_KEY = "gricki.deviceToken";

export type DeviceIdentity = {
	deviceId: string;
	token: string;
};

const bytesToHex = (bytes: Uint8Array): string => {
	return Array.from(bytes)
		.map((value) => value.toString(16).padStart(2, "0"))
		.join("");
};

export const loadOrCreateDeviceIdentity = async (): Promise<DeviceIdentity> => {
	const existingId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
	const existingToken = await SecureStore.getItemAsync(DEVICE_TOKEN_KEY);

	if (existingId && existingToken) {
		return { deviceId: existingId, token: existingToken };
	}

	const deviceId = Crypto.randomUUID();
	const tokenBytes = await Crypto.getRandomBytesAsync(32);
	const token = bytesToHex(tokenBytes);

	await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
	await SecureStore.setItemAsync(DEVICE_TOKEN_KEY, token);

	return { deviceId, token };
};

export const clearDeviceIdentity = async (): Promise<void> => {
	await SecureStore.deleteItemAsync(DEVICE_ID_KEY);
	await SecureStore.deleteItemAsync(DEVICE_TOKEN_KEY);
};

export const authorizationHeader = (identity: DeviceIdentity): string => {
	return `Bearer ${identity.deviceId}.${identity.token}`;
};
