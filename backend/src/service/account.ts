import { Device, QuizAttempt, RateLimitBucket, StoryProgress, TimingAttempt } from "../models";
import { hashToken, tokensEqual } from "../utils";

import { hashRateLimitKey } from "./rate-limit";

export type DeleteAccountResult = "deleted" | "already_gone" | "unauthorized";

export const deleteDeviceAccount = async (
	deviceId: string,
	token: string,
): Promise<DeleteAccountResult> => {
	const device = await Device.findOne({ deviceId }).select("+tokenHash").exec();

	if (!device) {
		return "already_gone";
	}

	if (!tokensEqual(device.tokenHash, hashToken(token))) {
		return "unauthorized";
	}

	await Promise.all([
		StoryProgress.deleteMany({ deviceId }),
		QuizAttempt.deleteMany({ deviceId }),
		TimingAttempt.deleteMany({ deviceId }),
		RateLimitBucket.deleteMany({
			keyHash: {
				$in: [
					hashRateLimitKey(`read:device:${deviceId}`),
					hashRateLimitKey(`answers:device:${deviceId}`),
				],
			},
		}),
	]);

	await Device.deleteOne({ deviceId });
	return "deleted";
};
