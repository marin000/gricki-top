import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const REMINDER_DAYS = 30;
const CHANNEL_ID = "noon-reminder";

try {
	Notifications.setNotificationHandler({
		handleNotification: async () => ({
			shouldShowBanner: true,
			shouldShowList: true,
			shouldPlaySound: false,
			shouldSetBadge: false,
		}),
	});
} catch {
	// Expo Go / mismatched native module — reminders stay best-effort
}

const ensureAndroidChannel = async (): Promise<void> => {
	if (Platform.OS !== "android") {
		return;
	}
	try {
		await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
			name: "Podsjetnik za podne",
			importance: Notifications.AndroidImportance.DEFAULT,
		});
	} catch {
		// Channel API can NPE in some Expo Go builds; scheduling may still work without it
	}
};

export const cancelNoonReminders = async (): Promise<void> => {
	try {
		await Notifications.cancelAllScheduledNotificationsAsync();
	} catch {
		// ignore
	}
};

export const scheduleNoonReminders = async (options: {
	enabled: boolean;
	leadMinutes: number;
}): Promise<void> => {
	try {
		await cancelNoonReminders();
		if (!options.enabled) {
			return;
		}

		const permission = await Notifications.requestPermissionsAsync();
		if (!permission.granted) {
			return;
		}

		await ensureAndroidChannel();

		const lead = Math.max(0, Math.min(options.leadMinutes, 30));
		const now = new Date();

		for (let dayOffset = 0; dayOffset < REMINDER_DAYS; dayOffset += 1) {
			const fireAt = new Date(now);
			fireAt.setDate(now.getDate() + dayOffset);
			fireAt.setHours(12, 0, 0, 0);
			fireAt.setMinutes(fireAt.getMinutes() - lead);

			if (fireAt.getTime() <= Date.now() + 5_000) {
				continue;
			}

			await Notifications.scheduleNotificationAsync({
				content: {
					title: "Grički top",
					body: "Još minuta do zagrebačkog podneva.",
					sound: false,
				},
				trigger: {
					type: Notifications.SchedulableTriggerInputTypes.DATE,
					date: fireAt,
					...(Platform.OS === "android" ? { channelId: CHANNEL_ID } : {}),
				},
			});
		}
	} catch {
		// Soft-fail: reminder toggle should never crash the app
	}
};
