import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, Linking, Modal, Pressable, Text, View } from "react-native";

import { AppHeader, Button, Screen, SectionHeader, Toggle } from "@/components";
import { theme } from "@/constants";
import { useDeleteAccount, useSettings } from "@/hooks";

export const SettingsPanel = () => {
	const { t } = useTranslation();
	const { settings, patchMutation } = useSettings();
	const { confirmVisible, openConfirm, closeConfirm, deleteMutation } = useDeleteAccount();

	const onConfirmDelete = () => {
		deleteMutation.mutate(undefined, {
			onSuccess: () => {
				closeConfirm();
			},
			onError: () => {
				Alert.alert(t("settings.deleteLabel"), t("settings.deleteError"));
			},
		});
	};

	return (
		<Screen scroll>
			<AppHeader eyebrow={t("settings.eyebrow")} />
			<Text className="mt-5 font-display text-3xl leading-9 text-ink-primary">
				{t("settings.headline")}
			</Text>
			<Text className="mt-3 font-body text-base leading-6 text-ink-muted">
				{t("settings.subtitle")}
			</Text>

			<View className="mt-8 flex-row items-end gap-4">
				<Text className="font-display-bold text-5xl text-red">1877.</Text>
				<View className="flex-1 pb-1">
					<Text className="font-body-semibold text-xs uppercase tracking-widest text-ink-muted">
						{t("settings.tradition")}
					</Text>
					<Text className="mt-1 font-display text-2xl leading-7 text-ink-primary">
						{t("settings.heroTitle")}
					</Text>
				</View>
			</View>

			<Text className="mt-5 font-body text-base leading-6 text-ink-muted">{t("settings.aboutBody1")}</Text>
			<Text className="mt-3 font-body text-base leading-6 text-ink-muted">{t("settings.aboutBody2")}</Text>

			<View className="mt-6 rounded-3xl border border-line bg-cream p-4">
				<Text className="font-body-semibold text-xs uppercase tracking-widest text-red">
					{t("settings.locationEyebrow")}
				</Text>
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
				<Text className="ml-3 flex-1 font-body text-sm leading-5 text-ink-muted">
					{t("settings.recreationNote")}
				</Text>
			</View>

			<SectionHeader title={t("settings.deleteHeading")} />
			<Pressable
				accessibilityRole="button"
				onPress={openConfirm}
				className="rounded-2xl border border-line bg-cream px-4 py-4 active:opacity-80"
			>
				<Text className="font-body-semibold text-base text-red">{t("settings.deleteLabel")}</Text>
				<Text className="mt-1 font-body text-sm text-ink-muted">{t("settings.deleteHint")}</Text>
			</Pressable>

			<Text className="mt-6 mb-4 text-center font-body text-xs text-ink-muted">{t("settings.footer")}</Text>

			<Modal visible={confirmVisible} transparent animationType="fade" onRequestClose={closeConfirm}>
				<Pressable className="flex-1 items-center justify-center bg-ink-primary/40 px-6" onPress={closeConfirm}>
					<Pressable
						className="w-full rounded-3xl bg-cream p-5"
						onPress={(event) => event.stopPropagation()}
					>
						<Text className="font-display text-2xl text-ink-primary">{t("settings.deleteConfirmTitle")}</Text>
						<Text className="mt-3 font-body text-base leading-6 text-ink-muted">
							{t("settings.deleteConfirmBody")}
						</Text>
						<View className="mt-6 gap-3">
							{deleteMutation.isPending ? (
								<ActivityIndicator color={theme.accent} />
							) : (
								<>
									<Button label={t("settings.deleteConfirm")} onPress={onConfirmDelete} />
									<Button
										label={t("settings.deleteCancel")}
										onPress={closeConfirm}
										variant="secondary"
									/>
								</>
							)}
						</View>
					</Pressable>
				</Pressable>
			</Modal>
		</Screen>
	);
};
