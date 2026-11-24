import { useEffect, useRef } from "react";

import { cancelNoonReminders, scheduleNoonReminders } from "@/utils/reminders";

import { useSettings } from "./use-settings";

export const useNoonReminders = () => {
	const { settings } = useSettings();
	const lastKey = useRef<string | null>(null);

	useEffect(() => {
		const key = `${settings.reminderEnabled}:${settings.reminderLeadMinutes}`;
		if (lastKey.current === key) {
			return;
		}
		lastKey.current = key;

		void (async () => {
			if (!settings.reminderEnabled) {
				await cancelNoonReminders();
				return;
			}
			await scheduleNoonReminders({
				enabled: true,
				leadMinutes: settings.reminderLeadMinutes || 1,
			});
		})();
	}, [settings.reminderEnabled, settings.reminderLeadMinutes]);
};
