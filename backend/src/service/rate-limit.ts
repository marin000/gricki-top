import { createHash } from "node:crypto";

import { config } from "../config";
import { RateLimitBucket } from "../models";

const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

export type RateLimitResult = {
	allowed: boolean;
	retryAfterSec: number;
	remaining: number;
};

const windowStartFor = (nowMs: number, windowMs: number): Date => {
	return new Date(Math.floor(nowMs / windowMs) * windowMs);
};

export const hashRateLimitKey = (value: string): string => {
	return createHash("sha256").update(value, "utf8").digest("hex");
};

export const consumeRateLimit = async (
	key: string,
	windowMs: number,
	limit: number,
	now: Date = new Date(),
): Promise<RateLimitResult> => {
	const nowMs = now.getTime();
	const windowStart = windowStartFor(nowMs, windowMs);
	const expiresAt = new Date(windowStart.getTime() + windowMs * 2);
	const keyHash = hashRateLimitKey(key);

	const bucket = await RateLimitBucket.findOneAndUpdate(
		{ keyHash, windowStart },
		{
			$inc: { count: 1 },
			$setOnInsert: { expiresAt },
		},
		{ upsert: true, new: true },
	).exec();

	const count = bucket?.count ?? limit + 1;
	if (count > limit) {
		const retryAfterSec = Math.max(1, Math.ceil((windowStart.getTime() + windowMs - nowMs) / 1000));
		return { allowed: false, retryAfterSec, remaining: 0 };
	}

	return { allowed: true, retryAfterSec: 0, remaining: Math.max(0, limit - count) };
};

export const consumeRegisterLimit = (ipOrFallback: string, now?: Date): Promise<RateLimitResult> => {
	return consumeRateLimit(`register:ip:${ipOrFallback}`, HOUR_MS, config.rateLimit.registerPerHour, now);
};

export const consumeReadLimit = (deviceId: string, now?: Date): Promise<RateLimitResult> => {
	return consumeRateLimit(`read:device:${deviceId}`, MINUTE_MS, config.rateLimit.readPerMinute, now);
};

export const consumeAnswerLimit = (deviceId: string, now?: Date): Promise<RateLimitResult> => {
	return consumeRateLimit(`answers:device:${deviceId}`, MINUTE_MS, config.rateLimit.answersPerMinute, now);
};
