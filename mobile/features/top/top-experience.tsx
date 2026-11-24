import { router } from "expo-router";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";

import { AppHeader, Button, CannonScene, CountdownClock, Screen, Toggle } from "@/components";
import { theme } from "@/constants";
import {
	useDailyStorySheet,
	useNoonReminders,
	useSettings,
	useTopExperience,
} from "@/hooks";
import { TIMING_WINDOW_MS } from "@/utils/noon";

import { CannonFireOverlay } from "./cannon-fire-overlay";
import { ChallengeInfoModal } from "./challenge-info-modal";
import { DailyStorySheet } from "./daily-story-sheet";

const RoundIcon = ({
	children,
	filled = false,
}: {
	children: ReactNode;
	filled?: boolean;
}) => (
	<View
		className={`h-11 w-11 items-center justify-center rounded-full border ${
			filled ? "border-red bg-red" : "border-blue bg-transparent"
		}`}
	>
		{children}
	</View>
);

export const TopExperience = () => {
	const { t } = useTranslation();
	useNoonReminders();

	const top = useTopExperience();
	const { settings, patchMutation } = useSettings();
	const sheet = useDailyStorySheet({
		eligible: top.sheetEligible && !top.fireOverlayVisible,
		onHandled: top.clearSheetEligible,
	});

	const story = top.bootstrap?.latestPublishedContent ?? null;
	const storyUnlocked = Boolean(story) && top.noonPassed;
	const windowSeconds = TIMING_WINDOW_MS / 1000;

	const openDailyStory = () => {
		if (storyUnlocked && story) {
			router.push(`/story/${story.storyId}`);
		}
	};

	return (
		<Screen scroll>
			<AppHeader eyebrow={t("top.headerEyebrow")} />

			<View className="mt-2">
				<CannonScene
					recoil={top.cannon.recoil}
					flash={top.cannon.flash}
					smokeOpacity={top.cannon.smokeOpacity}
					isFiring={top.cannon.isFiring && !top.fireOverlayVisible}
				/>
				<CountdownClock
					parts={top.countdownParts}
					eyebrow={t("top.countdownLabel")}
					hint={t("top.countdownHint")}
				/>
			</View>

			<View className="mt-7 border-t border-line">
				<View className="min-h-[38px] flex-row items-center justify-between">
					<Text className="font-body-semibold text-[9px] uppercase tracking-[0.16em] text-ink-muted">
						{t("top.modesHeading")}
					</Text>
					<Text className="text-red">✦</Text>
				</View>

				<Pressable
					accessibilityRole="button"
					onPress={() => void top.playDemo()}
					className="flex-row items-center border-b border-line py-4 active:opacity-80"
				>
					<Text className="w-10 font-display text-xl text-red">01</Text>
					<View className="flex-1 pr-3">
						<Text className="font-display text-2xl text-ink-primary">{t("top.modeExperience")}</Text>
						<Text className="mt-0.5 font-body text-sm text-ink-muted">
							{t("top.modeExperienceHint")}
						</Text>
					</View>
					<RoundIcon>
						<Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
							<Path
								d="m9 5 7 7-7 7"
								stroke={theme.tint}
								strokeWidth={1.7}
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</Svg>
					</RoundIcon>
				</Pressable>

				<Pressable
					accessibilityRole="button"
					onPress={top.selectChallengeMode}
					className="flex-row items-center border-b border-line py-4 active:opacity-80"
				>
					<Text className="w-10 font-display text-xl text-red">02</Text>
					<View className="flex-1 pr-3">
						<Text className="font-display text-2xl text-ink-primary">{t("top.modeChallenge")}</Text>
						<Text className="mt-0.5 font-body text-sm text-ink-muted">
							{t("top.modeChallengeHint")}
						</Text>
					</View>
					<RoundIcon filled>
						<Svg width={19} height={19} viewBox="0 0 24 24" fill="none">
							<Circle cx="12" cy="12" r="8" stroke={theme.paper} strokeWidth={1.7} />
							<Circle cx="12" cy="12" r="3.5" stroke={theme.paper} strokeWidth={1.7} />
							<Path
								d="M12 2V5M22 12h-3M12 22v-3M2 12h3"
								stroke={theme.paper}
								strokeWidth={1.7}
								strokeLinecap="round"
							/>
						</Svg>
					</RoundIcon>
				</Pressable>
			</View>

			{top.mode === "challenge" && top.challengeArmed && top.inWindow ? (
				<View className="mt-4">
					<Button
						label={t("top.tapButton")}
						onPress={() => void top.submitTap()}
						disabled={top.isSubmitting}
					/>
				</View>
			) : null}

			{top.challengeAborted ? (
				<Text className="mt-3 font-body text-sm text-red">{t("top.challengeAborted")}</Text>
			) : null}

			{top.localDeltaLabel || top.timingResult ? (
				<View className="mt-4 rounded-2xl border border-line bg-cream-deep p-4">
					<Text className="font-body-semibold text-xs uppercase tracking-widest text-red">
						{t("top.timingResult")}
					</Text>
					<Text className="mt-2 font-display text-3xl text-ink-primary">
						{top.localDeltaLabel ?? top.timingResult?.label}
					</Text>
					{top.timingResult?.syncStatus === "unverified" ? (
						<Text className="mt-2 font-body text-sm text-ink-muted">{t("top.unverified")}</Text>
					) : null}
					<View className="mt-3">
						<Button
							label={t("top.dismissResult")}
							onPress={top.dismissTimingResult}
							variant="ghost"
						/>
					</View>
				</View>
			) : null}

			{top.timingError ? (
				<Text className="mt-3 font-body text-sm text-red">{top.timingError}</Text>
			) : null}

			<Pressable
				accessibilityRole="button"
				disabled={!storyUnlocked}
				onPress={openDailyStory}
				className={`mt-6 flex-row items-center rounded-2xl border border-line bg-cream px-4 py-4 ${
					storyUnlocked ? "active:opacity-80" : "opacity-70"
				}`}
			>
				<View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-red">
					<Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
						{storyUnlocked ? (
							<>
								<Path
									d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22V5.5Z"
									stroke={theme.paper}
									strokeWidth={1.7}
								/>
								<Path
									d="M20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22V5.5Z"
									stroke={theme.paper}
									strokeWidth={1.7}
								/>
							</>
						) : (
							<>
								<Rect
									x={5}
									y={10}
									width={14}
									height={11}
									rx={2}
									stroke={theme.paper}
									strokeWidth={1.7}
									fill="none"
								/>
								<Path
									d="M8 10V7a4 4 0 0 1 8 0v3"
									stroke={theme.paper}
									strokeWidth={1.7}
								/>
							</>
						)}
					</Svg>
				</View>
				<View className="flex-1 pr-2">
					<Text className="font-body-semibold text-[10px] uppercase tracking-[0.14em] text-red">
						{storyUnlocked ? t("top.dailyStoryLabel") : t("top.sheetEyebrow")}
					</Text>
					<Text className="mt-1 font-display text-xl text-ink-primary" numberOfLines={2}>
						{storyUnlocked && story ? story.title : t("top.dailyStoryLocked")}
					</Text>
				</View>
				{storyUnlocked ? (
					<Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
						<Path
							d="m9 5 7 7-7 7"
							stroke={theme.textMuted}
							strokeWidth={1.7}
							strokeLinecap="round"
						/>
					</Svg>
				) : null}
			</Pressable>

			<View className="mt-5 mb-6 flex-row items-center rounded-2xl border border-line bg-cream px-4 py-4">
				<View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-blue-pale">
					<Svg width={19} height={19} viewBox="0 0 24 24" fill="none">
						<Path
							d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8.5h18C21 16 18 16 18 9Z"
							stroke={theme.tint}
							strokeWidth={1.7}
						/>
						<Path d="M9.5 20a3 3 0 0 0 5 0" stroke={theme.tint} strokeWidth={1.7} />
					</Svg>
				</View>
				<View className="flex-1 pr-3">
					<Text className="font-body-semibold text-base text-ink-primary">
						{t("top.reminderTitle")}
					</Text>
					<Text className="font-body text-sm text-ink-muted">{t("top.reminderHint")}</Text>
				</View>
				<Toggle
					checked={settings.reminderEnabled}
					label={t("top.reminderTitle")}
					disabled={patchMutation.isPending}
					onChange={(reminderEnabled) => patchMutation.mutate({ reminderEnabled })}
				/>
			</View>

			<CannonFireOverlay
				visible={top.fireOverlayVisible}
				isFiring={top.cannon.isFiring}
				smokeOpacity={top.cannon.smokeOpacity}
				recoil={top.cannon.recoil}
				flash={top.cannon.flash}
				onClose={top.closeFireOverlay}
			/>

			<ChallengeInfoModal
				visible={top.challengeInfoVisible}
				seconds={windowSeconds}
				beforeWindow={top.beforeWindow}
				onClose={top.closeChallengeInfo}
			/>

			{sheet.story ? (
				<DailyStorySheet
					visible={sheet.visible}
					title={sheet.story.title}
					lead={sheet.story.lead}
					onRead={() => void sheet.openStory()}
					onLater={() => void sheet.dismiss()}
				/>
			) : null}
		</Screen>
	);
};
