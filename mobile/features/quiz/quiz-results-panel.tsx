import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { AppHeader, EmptyState, Screen } from "@/components";
import { theme } from "@/constants";
import { useQuizResults, useTimingResults } from "@/hooks";

type ResultsTab = "timing" | "quiz";

const formatAbsSeconds = (deltaMs: number) =>
	(Math.abs(deltaMs) / 1000).toFixed(2).replace(".", ",");

export const QuizResultsPanel = () => {
	const { t } = useTranslation();
	const [tab, setTab] = useState<ResultsTab>("timing");
	const quizQuery = useQuizResults();
	const timingQuery = useTimingResults();

	const aggregates = quizQuery.data?.aggregates;
	const timingAggregates = timingQuery.data?.aggregates;
	const timingItems = timingQuery.data?.items ?? [];
	const isLoading = tab === "quiz" ? quizQuery.isLoading : timingQuery.isLoading;

	const best = useMemo(() => {
		const synced = timingItems.filter((item) => item.syncStatus === "synced");
		if (synced.length === 0) {
			return null;
		}
		return synced.reduce((winner, item) =>
			Math.abs(item.deltaMs) < Math.abs(winner.deltaMs) ? item : winner,
		);
	}, [timingItems]);

	const todayItem = timingItems[0] ?? null;
	const daysPlayed = timingAggregates?.attemptCount ?? timingItems.length;
	const streak = useMemo(() => {
		if (timingItems.length === 0) {
			return 0;
		}
		const dates = [...new Set(timingItems.map((item) => item.localDate))].sort().reverse();
		let count = 0;
		let cursor: Date | null = null;
		for (const date of dates) {
			const current = new Date(`${date}T12:00:00`);
			if (!cursor) {
				cursor = current;
				count = 1;
				continue;
			}
			const diffDays = Math.round((cursor.getTime() - current.getTime()) / 86_400_000);
			if (diffDays === 1) {
				count += 1;
				cursor = current;
			} else {
				break;
			}
		}
		return count;
	}, [timingItems]);

	return (
		<Screen scroll>
			<AppHeader eyebrow={t("results.headerEyebrow")} />

			<View className="mt-5">
				<Text className="font-body-semibold text-[10px] uppercase tracking-[0.17em] text-red">
					{t("results.introEyebrow")}
				</Text>
				<Text className="mt-2 font-display text-3xl leading-9 text-ink-primary">
					{t("results.headline")}
				</Text>
				<Text className="mt-3 font-body text-base leading-6 text-ink-muted">
					{t("results.subtitle")}
				</Text>
			</View>

			<View className="mt-5 flex-row border-b border-line">
				<Pressable
					accessibilityRole="tab"
					onPress={() => setTab("timing")}
					className={`mr-5 pb-3 ${tab === "timing" ? "border-b-2 border-red" : ""}`}
				>
					<Text
						className={`font-body-semibold text-sm ${
							tab === "timing" ? "text-ink-primary" : "text-ink-muted"
						}`}
					>
						{t("results.tabTiming")}
					</Text>
				</Pressable>
				<Pressable
					accessibilityRole="tab"
					onPress={() => setTab("quiz")}
					className={`pb-3 ${tab === "quiz" ? "border-b-2 border-red" : ""}`}
				>
					<Text
						className={`font-body-semibold text-sm ${
							tab === "quiz" ? "text-ink-primary" : "text-ink-muted"
						}`}
					>
						{t("results.tabQuiz")}
					</Text>
				</Pressable>
			</View>

			{isLoading ? (
				<View className="items-center py-12">
					<ActivityIndicator color={theme.tint} />
				</View>
			) : null}

			{tab === "timing" ? (
				<>
					<View className="mt-5 flex-row items-center rounded-2xl bg-blue p-5">
						<View className="flex-1">
							<Text className="font-body-semibold text-[10px] uppercase tracking-[0.14em] text-metal-light">
								{t("results.personalBest")}
							</Text>
							<Text className="mt-2 font-display text-4xl text-ink-inverse">
								{best ? formatAbsSeconds(best.deltaMs) : "—"}
								{best ? (
									<Text className="font-display text-xl text-metal-light">
										{" "}
										{t("results.seconds")}
									</Text>
								) : null}
							</Text>
							<Text className="mt-1 font-body text-sm text-blue-pale">
								{best
									? `${best.deltaMs < 0 ? t("results.early") : t("results.late")} · ${best.localDate}`
									: t("results.timingEmpty")}
							</Text>
						</View>
						<View className="h-16 w-16 items-center justify-center rounded-full border border-metal-light">
							<Svg width={40} height={40} viewBox="0 0 70 70" fill="none">
								<Circle cx="35" cy="35" r="28" stroke={theme.paper} strokeWidth={1.6} />
								<Path
									d="M35 14v42M14 35h42M20 20l30 30M50 20 20 50"
									stroke={theme.paper}
									strokeWidth={1.6}
								/>
								<Circle cx="35" cy="35" r="9" stroke={theme.paper} strokeWidth={1.6} />
							</Svg>
						</View>
					</View>

					<View className="mt-4 flex-row border-y border-line py-4">
						<View className="flex-1 items-center border-r border-line">
							<Text className="font-display text-3xl text-ink-primary">{daysPlayed}</Text>
							<Text className="mt-1 font-body text-xs text-ink-muted">
								{t("results.daysPlayed")}
							</Text>
						</View>
						<View className="flex-1 items-center border-r border-line">
							<Text className="font-display text-3xl text-ink-primary">{streak}</Text>
							<Text className="mt-1 font-body text-xs text-ink-muted">{t("results.streak")}</Text>
						</View>
						<View className="flex-1 items-center">
							<Text className="font-display text-3xl text-ink-primary">
								{todayItem ? `${formatAbsSeconds(todayItem.deltaMs)} s` : "—"}
							</Text>
							<Text className="mt-1 font-body text-xs text-ink-muted">{t("results.today")}</Text>
						</View>
					</View>

					<View className="mt-6 min-h-[38px] flex-row items-center justify-between">
						<Text className="font-body-semibold text-[9px] uppercase tracking-[0.16em] text-ink-muted">
							{t("results.historyHeading")}
						</Text>
						<Text className="font-body-semibold text-[9px] uppercase tracking-[0.12em] text-ink-muted">
							{t("results.historyMeta", { count: Math.min(timingItems.length, 4) })}
						</Text>
					</View>

					{timingItems.length === 0 ? <EmptyState title={t("results.timingEmpty")} /> : null}

					{timingItems.slice(0, 8).map((item) => (
						<View
							key={item.id}
							className="flex-row items-center justify-between border-b border-line py-4"
						>
							<View className="flex-1 pr-3">
								<Text className="font-display text-xl text-ink-primary">{item.localDate}</Text>
								<Text className="mt-0.5 font-body text-xs text-ink-muted">
									12:00 ·{" "}
									{item.syncStatus === "synced"
										? t("results.timingSynced")
										: t("results.timingUnverified")}
								</Text>
							</View>
							<View className="items-end">
								<Text
									className={`font-body-semibold text-base ${
										item.deltaMs < 0 ? "text-red" : "text-blue"
									}`}
								>
									{item.label}
								</Text>
								<Text className="mt-0.5 font-body text-[10px] uppercase tracking-widest text-ink-muted">
									{item.deltaMs < 0 ? t("results.earlyTag") : t("results.lateTag")}
								</Text>
							</View>
						</View>
					))}
				</>
			) : (
				<>
					{aggregates ? (
						<View className="mt-5 rounded-2xl border border-line bg-cream p-5">
							<Text className="font-body text-sm text-ink-muted">{t("results.completed")}</Text>
							<Text className="mt-1 font-display text-3xl text-ink-primary">
								{aggregates.completedCount}
							</Text>
							<Text className="mt-4 font-body text-sm text-ink-muted">{t("results.totalScore")}</Text>
							<Text className="mt-1 font-display text-3xl text-ink-primary">
								{aggregates.totalScore}
							</Text>
							<Text className="mt-4 font-body text-sm text-ink-muted">{t("results.average")}</Text>
							<Text className="mt-1 font-display text-3xl text-ink-primary">
								{aggregates.averageScore === null
									? "—"
									: aggregates.averageScore.toFixed(2)}
							</Text>
						</View>
					) : null}

					{quizQuery.data?.items.length === 0 ? (
						<EmptyState title={t("results.empty")} />
					) : null}

					{quizQuery.data?.items.map((item) => (
						<View key={item.id} className="mt-3 rounded-2xl border border-line bg-cream p-4">
							<Text className="font-body text-xs text-ink-muted">{item.dailyQuizId}</Text>
							<Text className="mt-1 font-display text-2xl text-ink-primary">
								{t("quiz.score", { score: item.score })}
							</Text>
							{item.completedAt ? (
								<Text className="mt-1 font-body text-sm text-ink-muted">
									{new Date(item.completedAt).toLocaleString("hr-HR")}
								</Text>
							) : null}
						</View>
					))}
				</>
			)}
		</Screen>
	);
};
