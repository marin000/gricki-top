import {
	type TimingAttempt,
	type TimingResultsList,
	timingAttemptSchema,
	timingResultsListSchema,
} from "@/interface";
import type { DeviceIdentity } from "@/utils/device-identity";

import { apiRequest } from "./client";

export const createTimingAttempt = async (
	identity: DeviceIdentity,
	body: {
		localDate: string;
		clientAttemptId: string;
		estimatedTapAt: string;
		syncStatus: "synced" | "unverified";
		clockRttMs?: number;
		appVersion: string;
	},
): Promise<TimingAttempt> => {
	const payload = await apiRequest<unknown>("/v1/me/timing-attempts", {
		method: "POST",
		identity,
		body,
	});
	return timingAttemptSchema.parse(payload);
};

export const fetchTimingResults = async (
	identity: DeviceIdentity,
): Promise<TimingResultsList> => {
	const payload = await apiRequest<unknown>(
		"/v1/me/results?type=timing&limit=20",
		{ identity },
	);
	return timingResultsListSchema.parse(payload);
};
