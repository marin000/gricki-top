export const TIMING_WINDOW_MS = 60_000;

export const msUntil = (targetMs: number, nowMs: number): number => targetMs - nowMs;

export type CountdownParts = {
	hours: string;
	minutes: string;
	seconds: string;
	totalSeconds: number;
};

const pad = (value: number) => value.toString().padStart(2, "0");

export const getCountdownParts = (remainingMs: number): CountdownParts => {
	const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	return {
		hours: pad(hours),
		minutes: pad(minutes),
		seconds: pad(seconds),
		totalSeconds,
	};
};

export const formatCountdown = (remainingMs: number): string => {
	const { hours, minutes, seconds, totalSeconds } = getCountdownParts(remainingMs);
	if (totalSeconds >= 3600) {
		return `${hours}:${minutes}:${seconds}`;
	}
	return `${minutes}:${seconds}`;
};

export const formatDeltaLabel = (deltaMs: number): string => {
	if (deltaMs === 0) {
		return "točno";
	}
	const seconds = (Math.abs(deltaMs) / 1000).toFixed(2).replace(".", ",");
	return deltaMs < 0 ? `${seconds} s prerano` : `${seconds} s prekasno`;
};

export const isInsideTimingWindow = (
	nowMs: number,
	noonMs: number,
	windowMs = TIMING_WINDOW_MS,
): boolean => {
	return Math.abs(nowMs - noonMs) <= windowMs;
};

export const hasPassedNoon = (nowMs: number, noonMs: number): boolean => nowMs >= noonMs;

/** Countdown target: today's noon if still ahead, otherwise next noon. */
export const resolveCountdownTargetMs = (
	nowMs: number,
	todayNoonMs: number | null,
	nextNoonMs: number | null,
): number | null => {
	if (todayNoonMs == null) {
		return nextNoonMs;
	}
	if (nowMs < todayNoonMs) {
		return todayNoonMs;
	}
	return nextNoonMs ?? todayNoonMs;
};
