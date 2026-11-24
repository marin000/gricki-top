import { randomUUID } from "node:crypto";

import { TimingAttempt } from "../models";
import { noonAtLocalDate } from "./time";

const WINDOW_MS = 60_000;

const mapTiming = (row: {
	id: string;
	localDate: string;
	clientAttemptId: string;
	noonAt: Date;
	estimatedTapAt: Date;
	deltaMs: number;
	syncStatus: "synced" | "unverified";
	clockRttMs?: number | null;
	recordedAt: Date;
}) => ({
	id: row.id,
	localDate: row.localDate,
	clientAttemptId: row.clientAttemptId,
	noonAt: row.noonAt.toISOString(),
	estimatedTapAt: row.estimatedTapAt.toISOString(),
	deltaMs: row.deltaMs,
	syncStatus: row.syncStatus,
	clockRttMs: row.clockRttMs ?? null,
	recordedAt: row.recordedAt.toISOString(),
	label:
		row.deltaMs === 0
			? "točno"
			: row.deltaMs < 0
				? `${(Math.abs(row.deltaMs) / 1000).toFixed(2).replace(".", ",")} s prerano`
				: `${(Math.abs(row.deltaMs) / 1000).toFixed(2).replace(".", ",")} s prekasno`,
});

export const createTimingAttempt = async (input: {
	deviceId: string;
	localDate: string;
	clientAttemptId: string;
	estimatedTapAt: string;
	syncStatus: "synced" | "unverified";
	clockRttMs?: number;
	appVersion: string;
	now?: Date;
}) => {
	const existingByClient = await TimingAttempt.findOne({
		deviceId: input.deviceId,
		clientAttemptId: input.clientAttemptId,
	}).exec();
	if (existingByClient) {
		return { status: "ok" as const, created: false, attempt: mapTiming(existingByClient) };
	}

	const existingByDay = await TimingAttempt.findOne({
		deviceId: input.deviceId,
		localDate: input.localDate,
	}).exec();
	if (existingByDay) {
		return { status: "conflict" as const, attempt: mapTiming(existingByDay) };
	}

	if (!/^\d{4}-\d{2}-\d{2}$/.test(input.localDate)) {
		return { status: "invalid" as const };
	}

	const noon = noonAtLocalDate(input.localDate);
	const tap = new Date(input.estimatedTapAt);
	if (Number.isNaN(tap.getTime())) {
		return { status: "invalid" as const };
	}

	const deltaMs = tap.getTime() - noon.toUTC().toMillis();
	if (!Number.isFinite(deltaMs) || Math.abs(deltaMs) > WINDOW_MS + 5_000) {
		return { status: "invalid" as const };
	}

	const created = await TimingAttempt.create({
		id: randomUUID(),
		deviceId: input.deviceId,
		localDate: input.localDate,
		clientAttemptId: input.clientAttemptId,
		noonAt: noon.toUTC().toJSDate(),
		estimatedTapAt: tap,
		deltaMs,
		syncStatus: input.syncStatus,
		clockRttMs: input.clockRttMs ?? null,
		recordedAt: input.now ?? new Date(),
		appVersion: input.appVersion,
	});

	return { status: "ok" as const, created: true, attempt: mapTiming(created) };
};

export const listTimingResults = async (deviceId: string, options: { limit: number; cursor?: string }) => {
	const limit = Math.min(Math.max(options.limit, 1), 50);
	const filter: Record<string, unknown> = { deviceId };
	if (options.cursor) {
		const recordedAt = new Date(options.cursor);
		if (!Number.isNaN(recordedAt.getTime())) {
			filter.recordedAt = { $lt: recordedAt };
		}
	}

	const rows = await TimingAttempt.find(filter)
		.sort({ recordedAt: -1, id: -1 })
		.limit(limit + 1)
		.lean()
		.exec();
	const page = rows.slice(0, limit);
	const next = rows.length > limit ? page[page.length - 1] : null;

	const synced = await TimingAttempt.find({ deviceId, syncStatus: "synced" }).select("deltaMs").lean().exec();
	const bestAbs =
		synced.length === 0
			? null
			: Math.min(...synced.map((row) => Math.abs(row.deltaMs)));

	return {
		items: page.map(mapTiming),
		nextCursor: next?.recordedAt ? new Date(next.recordedAt).toISOString() : null,
		aggregates: {
			attemptCount: await TimingAttempt.countDocuments({ deviceId }),
			bestAbsDeltaMs: bestAbs,
		},
	};
};
