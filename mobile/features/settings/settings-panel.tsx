import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Linking, Pressable, Text, View } from "react-native";

import { PageHeader, Screen, SectionHeader, Toggle } from "@/components";
import { theme } from "@/constants";
import { useSettings } from "@/hooks";

export const SettingsPanel = () => {
	const { t } = useTranslation();
	const { settings, patchMutation } = useSettings();

	return (
		<Screen scroll>
			<PageHeader eyebrow={t("settings.eyebrow")} title={t("settings.headline")} subtitle={t("settings.subtitle")} />

			<View className="mt-8 flex-row items-end gap-4">
				<Text className="font-display-bold text-5xl text-red">1877.</Text>
				<View className="flex-1 pb-1">
					<Text className="font-body-semibold text-xs uppercase tracking-widest text-ink-muted">
						{t("settings.tradition")}
					</Text>
					<Text className="mt-1 font-display text-2xl leading-7 text-ink-primary">{t("settings.heroTitle")}</Text>
				</View>
			</View>

			<Text className="mt-5 font-body text-base leading-6 text-ink-muted">{t("settings.aboutBody1")}</Text>
			<Text className="mt-3 font-body text-base leading-6 text-ink-muted">{t("settings.aboutBody2")}</Text>

			<View className="mt-6 rounded-3xl border border-line bg-cream p-4">
				<Text className="font-body-semibold text-xs uppercase tracking-widest text-red">{t("settings.locationEyebrow")}</Text>
				<Text className="mt-2 font-display text-2xl text-ink-primary">{t("settings.locationTitle")}</Text>
				<Text className="mt-1 font-body text-base text-ink-muted">{t("settings.locationAddress")}</Text>
				<Pressable
					accessibilityRole="link"
					onPress={() => void Linking.openURL("https://maps.google.com/?q=Kula+Lotrscak+Zagreb")}
					className="mt-3 flex-row items-center"
				>
					<Ionicons name="map-outline" size={18} color={theme.tint} />
					<Text className="ml-2 font-body-semibold text-base text-blue">{t("settings.openMap")}</Text>
				</Pressable>
			</View>

			<SectionHeader title={t("settings.experienceHeading")} />

			<View className="rounded-2xl border border-line bg-cream">
				<View className="flex-row items-center border-b border-line px-4 py-4">
					<Ionicons name="notifications-outline" size={22} color={theme.tint} />
					<View className="ml-3 flex-1 pr-3">
						<Text className="font-body-semibold text-base text-ink-primary">{t("settings.reminder")}</Text>
						<Text className="font-body text-sm text-ink-muted">{t("settings.reminderHint")}</Text>
					</View>
					<Toggle
						checked={settings.reminderEnabled}
						label={t("settings.reminder")}
						disabled={patchMutation.isPending}
						onChange={(reminderEnabled) => patchMutation.mutate({ reminderEnabled })}
					/>
				</View>
				<View className="flex-row items-center border-b border-line px-4 py-4">
					<Ionicons name="volume-high-outline" size={22} color={theme.tint} />
					<View className="ml-3 flex-1 pr-3">
						<Text className="font-body-semibold text-base text-ink-primary">{t("settings.sound")}</Text>
						<Text className="font-body text-sm text-ink-muted">{t("settings.soundHint")}</Text>
					</View>
					<Toggle
						checked={settings.soundEnabled}
						label={t("settings.sound")}
						disabled={patchMutation.isPending}
						onChange={(soundEnabled) => patchMutation.mutate({ soundEnabled })}
					/>
				</View>
				<View className="flex-row items-center px-4 py-4">
					<Ionicons name="phone-portrait-outline" size={22} color={theme.tint} />
					<View className="ml-3 flex-1 pr-3">
						<Text className="font-body-semibold text-base text-ink-primary">{t("settings.haptics")}</Text>
						<Text className="font-body text-sm text-ink-muted">{t("settings.hapticsHint")}</Text>
					</View>
					<Toggle
						checked={settings.hapticsEnabled}
						label={t("settings.haptics")}
						disabled={patchMutation.isPending}
						onChange={(hapticsEnabled) => patchMutation.mutate({ hapticsEnabled })}
					/>
				</View>
			</View>

			<View className="mt-6 flex-row items-start rounded-2xl border border-line bg-cream-deep p-4">
				<Ionicons name="information-circle-outline" size={20} color={theme.accent} />
				<Text className="ml-3 flex-1 font-body text-sm leading-5 text-ink-muted">{t("settings.recreationNote")}</Text>
			</View>

			<Text className="mt-6 mb-4 text-center font-body text-xs text-ink-muted">{t("settings.footer")}</Text>
		</Screen>
	);
};
