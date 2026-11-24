import {
	ApiError,
	createTimingAttempt,
	markStoryProgress,
	patchSettings,
} from "@/api";
import type { DeviceSettings } from "@/interface";
import type { DeviceIdentity } from "@/utils/device-identity";

import { type OutboxItem, readOutbox, writeOutbox } from "./storage";

const DROP_STATUSES = new Set([400, 401, 404, 409]);
const MAX_ATTEMPTS = 5;
const BASE_BACKOFF_MS = 800;

let flushInFlight: Promise<void> | null = null;

const sleep = (ms: number) =>
	new Promise<void>((resolve) => setTimeout(resolve, ms));

const jitteredBackoffMs = (attempt: number, retryAfterSec?: number): number => {
	if (retryAfterSec != null && retryAfterSec > 0) {
		return retryAfterSec * 1000;
	}
	const exp = Math.min(30_000, BASE_BACKOFF_MS * 2 ** Math.max(0, attempt - 1));
	const jitter = Math.floor(Math.random() * 250);
	return exp + jitter;
};

const isRetryable = (error: unknown): error is ApiError | Error => {
	if (!(error instanceof Error)) {
		return true;
	}
	if (error instanceof ApiError) {
		if (DROP_STATUSES.has(error.status)) {
			return false;
		}
		return error.status === 429 || error.status >= 500 || error.status === 0;
	}
	return true;
};

/** Keep latest settings patch; keep latest story-progress per storyId; keep all timings. */
export const coalesceOutbox = (items: OutboxItem[]): OutboxItem[] => {
	const settingsItems = items.filter((item) => item.type === "settings");
	const storyItems = items.filter((item) => item.type === "story-progress");
	const timingItems = items.filter((item) => item.type === "timing");

	const coalescedSettings =
		settingsItems.length === 0
			? []
			: [
					{
						...settingsItems[settingsItems.length - 1],
						payload: settingsItems.reduce<Record<string, unknown>>(
							(acc, item) => ({ ...acc, ...item.payload }),
							{},
						),
					},
				];

	const latestByStory = new Map<string, OutboxItem>();
	for (const item of storyItems) {
		const storyId = String(item.payload.storyId ?? "");
		if (!storyId) {
			continue;
		}
		latestByStory.set(storyId, item);
	}

	const latestTimingByAttempt = new Map<string, OutboxItem>();
	for (const item of timingItems) {
		const attemptId = String(item.payload.clientAttemptId ?? item.id);
		latestTimingByAttempt.set(attemptId, item);
	}

	return [
		...coalescedSettings,
		...latestByStory.values(),
		...latestTimingByAttempt.values(),
	].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
};

const sendItem = async (
	identity: DeviceIdentity,
	item: OutboxItem,
): Promise<void> => {
	if (item.type === "settings") {
		const { clientRequestId: _id, ...settings } = item.payload;
		await patchSettings(identity, settings as Partial<DeviceSettings>);
		return;
	}

	if (item.type === "story-progress") {
		const storyId = String(item.payload.storyId ?? "");
		await markStoryProgress(identity, storyId, {
			markRead: Boolean(item.payload.markRead),
			dismissPrompt: Boolean(item.payload.dismissPrompt),
			clientRequestId: String(item.payload.clientRequestId ?? item.id),
		});
		return;
	}

	await createTimingAttempt(identity, {
		localDate: String(item.payload.localDate),
		clientAttemptId: String(item.payload.clientAttemptId),
		estimatedTapAt: String(item.payload.estimatedTapAt),
		syncStatus:
			(item.payload.syncStatus as "synced" | "unverified") ?? "unverified",
		clockRttMs:
			typeof item.payload.clockRttMs === "number"
				? item.payload.clockRttMs
				: undefined,
		appVersion: String(item.payload.appVersion ?? "1.0.0"),
	});
};

const flushOnce = async (identity: DeviceIdentity): Promise<void> => {
	const queued = coalesceOutbox(await readOutbox());
	await writeOutbox(queued);

	const remaining: OutboxItem[] = [];

	for (const item of queued) {
		let attempt = 0;
		let done = false;

		while (!done && attempt < MAX_ATTEMPTS) {
			attempt += 1;
			try {
				await sendItem(identity, item);
				done = true;
			} catch (error) {
				if (!isRetryable(error)) {
					done = true;
					break;
				}
				if (attempt >= MAX_ATTEMPTS) {
					remaining.push(item);
					remaining.push(...queued.slice(queued.indexOf(item) + 1));
					await writeOutbox(remaining);
					return;
				}
				const retryAfter =
					error instanceof ApiError ? error.retryAfterSec : undefined;
				await sleep(jitteredBackoffMs(attempt, retryAfter));
			}
		}
	}

	await writeOutbox(remaining);
};

export const flushOutbox = async (
	identity: DeviceIdentity | null,
): Promise<void> => {
	if (!identity) {
		return;
	}
	if (flushInFlight) {
		return flushInFlight;
	}
	flushInFlight = flushOnce(identity).finally(() => {
		flushInFlight = null;
	});
	return flushInFlight;
};
