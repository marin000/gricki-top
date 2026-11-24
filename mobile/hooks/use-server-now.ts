import { useEffect, useState } from "react";

import { useDevice } from "@/context";
import { estimateServerNowMs } from "@/utils/clock-sync";
import { resolveCountdownTargetMs } from "@/utils/noon";

export const useServerNow = (tickMs = 250) => {
	const { clockSync, bootstrap } = useDevice();
	const [nowMs, setNowMs] = useState(() => estimateServerNowMs(clockSync?.offsetMs ?? 0));

	useEffect(() => {
		const update = () => {
			setNowMs(estimateServerNowMs(clockSync?.offsetMs ?? 0));
		};
		update();
		const id = setInterval(update, tickMs);
		return () => clearInterval(id);
	}, [clockSync?.offsetMs, tickMs]);

	const noonMs = bootstrap?.todayNoonAt ? Date.parse(bootstrap.todayNoonAt) : null;
	const nextNoonMs = bootstrap?.nextNoonAt ? Date.parse(bootstrap.nextNoonAt) : null;
	const countdownTargetMs = resolveCountdownTargetMs(nowMs, noonMs, nextNoonMs);
	const localDate = bootstrap?.todayLocalDate ?? null;

	return {
		nowMs,
		noonMs,
		nextNoonMs,
		countdownTargetMs,
		localDate,
		offsetMs: clockSync?.offsetMs ?? 0,
		rttMs: clockSync?.rttMs ?? null,
	};
};
