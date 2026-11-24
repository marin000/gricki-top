import { fetchServerTime } from "@/api/time";
import type { ClockSnapshot } from "@/interface";

export type ClockSyncSample = {
	offsetMs: number;
	rttMs: number;
	snapshot: ClockSnapshot;
};

export type ClockSyncResult = {
	offsetMs: number;
	rttMs: number;
	snapshot: ClockSnapshot;
	samples: ClockSyncSample[];
};

/**
 * Estimate device↔server clock offset with 3 round-trips.
 * Uses the sample with the smallest RTT; offset is mid-RTT correction.
 */
export const sampleClockOffset = async (rounds = 3): Promise<ClockSyncResult> => {
	const samples: ClockSyncSample[] = [];

	for (let index = 0; index < rounds; index += 1) {
		const t0 = Date.now();
		const snapshot = await fetchServerTime();
		const t1 = Date.now();
		const rttMs = t1 - t0;
		const serverNowMs = Date.parse(snapshot.serverNow);
		const midpointClientMs = t0 + rttMs / 2;
		samples.push({
			snapshot,
			rttMs,
			offsetMs: serverNowMs - midpointClientMs,
		});
	}

	const best = samples.reduce((winner, sample) => (sample.rttMs < winner.rttMs ? sample : winner), samples[0]);

	return {
		offsetMs: best.offsetMs,
		rttMs: best.rttMs,
		snapshot: best.snapshot,
		samples,
	};
};

export const estimateServerNowMs = (offsetMs: number, atClientMs = Date.now()): number => {
	return atClientMs + offsetMs;
};
