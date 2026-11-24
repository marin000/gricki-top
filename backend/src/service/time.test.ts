import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";

import {
	latestPublishedDayNumber,
	noonAtLocalDate,
	publishAtForDay,
} from "./time";

describe("Zagreb noon schedule", () => {
	it("publishes day 1 at start date noon in winter", () => {
		const publish = publishAtForDay("2026-01-10", 1);
		expect(publish.toISOString()).toBe("2026-01-10T11:00:00.000Z");
	});

	it("publishes day 1 at start date noon in summer (DST)", () => {
		const publish = publishAtForDay("2026-07-10", 1);
		expect(publish.toISOString()).toBe("2026-07-10T10:00:00.000Z");
	});

	it("adds calendar days across DST spring forward", () => {
		// 2026-03-29 is DST start in Europe/Zagreb
		const dayBefore = publishAtForDay("2026-03-28", 1);
		const dayAfter = publishAtForDay("2026-03-28", 2);
		expect(dayBefore.toISOString()).toBe("2026-03-28T11:00:00.000Z");
		expect(dayAfter.toISOString()).toBe("2026-03-29T10:00:00.000Z");
	});

	it("keeps day locked at 11:59:59.999 and unlocks at 12:00:00.000", () => {
		const startDate = "2026-11-20";
		const locked = DateTime.fromISO("2026-11-24T11:59:59.999", {
			zone: "Europe/Zagreb",
		})
			.toUTC()
			.toJSDate();
		const unlocked = DateTime.fromISO("2026-11-24T12:00:00.000", {
			zone: "Europe/Zagreb",
		})
			.toUTC()
			.toJSDate();

		expect(latestPublishedDayNumber(startDate, locked)).toBe(4);
		expect(latestPublishedDayNumber(startDate, unlocked)).toBe(5);

		const noon = noonAtLocalDate("2026-11-24");
		expect(locked.getTime()).toBeLessThan(noon.toUTC().toMillis());
		expect(unlocked.getTime()).toBe(noon.toUTC().toMillis());
	});

	it("returns 0 before content start noon", () => {
		const before = DateTime.fromISO("2026-11-20T11:59:59.999", {
			zone: "Europe/Zagreb",
		})
			.toUTC()
			.toJSDate();
		const atStart = DateTime.fromISO("2026-11-20T12:00:00.000", {
			zone: "Europe/Zagreb",
		})
			.toUTC()
			.toJSDate();
		expect(latestPublishedDayNumber("2026-11-20", before)).toBe(0);
		expect(latestPublishedDayNumber("2026-11-20", atStart)).toBe(1);
	});
});
