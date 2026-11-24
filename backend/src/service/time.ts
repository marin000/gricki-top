import { DateTime } from "luxon";

import { config } from "../config";

export type ZagrebClockSnapshot = {
	serverNow: string;
	timezone: string;
	todayLocalDate: string;
	todayNoonAt: string;
	nextNoonAt: string;
};

const zone = (): string => config.timezone;

export const nowInZagreb = (at: Date = new Date()): DateTime => {
	return DateTime.fromJSDate(at, { zone: "utc" }).setZone(zone());
};

export const localDateString = (at: Date = new Date()): string => {
	return nowInZagreb(at).toFormat("yyyy-MM-dd");
};

export const noonAtLocalDate = (localDate: string): DateTime => {
	return DateTime.fromISO(`${localDate}T12:00:00`, { zone: zone() });
};

export const getClockSnapshot = (
	at: Date = new Date(),
): ZagrebClockSnapshot => {
	const local = nowInZagreb(at);
	const todayLocalDate = local.toFormat("yyyy-MM-dd");
	const todayNoon = noonAtLocalDate(todayLocalDate);
	const nextNoon = local < todayNoon ? todayNoon : todayNoon.plus({ days: 1 });

	return {
		serverNow:
			DateTime.fromJSDate(at, { zone: "utc" }).toUTC().toISO() ??
			at.toISOString(),
		timezone: zone(),
		todayLocalDate,
		todayNoonAt:
			todayNoon.toUTC().toISO() ?? todayNoon.toJSDate().toISOString(),
		nextNoonAt: nextNoon.toUTC().toISO() ?? nextNoon.toJSDate().toISOString(),
	};
};

/** Day 1 publishes at startDate 12:00 Zagreb; day N adds (N-1) calendar days in zone. */
export const publishAtForDay = (
	contentStartDate: string,
	dayNumber: number,
): Date => {
	const startNoon = noonAtLocalDate(contentStartDate);
	const publish = startNoon.plus({ days: dayNumber - 1 });
	return publish.toUTC().toJSDate();
};

export const latestPublishedDayNumber = (
	contentStartDate: string,
	at: Date = new Date(),
): number => {
	const start = noonAtLocalDate(contentStartDate);
	const now = DateTime.fromJSDate(at, { zone: "utc" });
	if (now < start.toUTC()) {
		return 0;
	}
	const localNow = now.setZone(zone());
	const startLocalDate = start.toFormat("yyyy-MM-dd");
	const today = localNow.toFormat("yyyy-MM-dd");
	const startDate = DateTime.fromISO(startLocalDate, { zone: zone() }).startOf(
		"day",
	);
	const todayDate = DateTime.fromISO(today, { zone: zone() }).startOf("day");
	const calendarDay = Math.floor(todayDate.diff(startDate, "days").days) + 1;
	const noonToday = noonAtLocalDate(today);
	const publishedThrough = localNow < noonToday ? calendarDay - 1 : calendarDay;
	return Math.max(0, Math.min(100, publishedThrough));
};
