import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, View } from "react-native";

import { fetchQuizResults } from "@/api";
import { EmptyState, PageHeader, Screen } from "@/components";
import { theme } from "@/constants";
import { useDevice } from "@/context";

export const QuizResultsPanel = () => {
	const { t } = useTranslation();
	const { identity } = useDevice();

	const resultsQuery = useQuery({
		queryKey: ["quiz-results", identity?.deviceId],
		enabled: Boolean(identity),
		queryFn: async () => {
			if (!identity) {
				throw new Error("missing_identity");
			}
			return fetchQuizResults(identity);
		},
	});

	const aggregates = resultsQuery.data?.aggregates;

	return (
		<Screen scroll>
			<PageHeader eyebrow={t("results.eyebrow")} title={t("results.title")} subtitle={t("results.subtitle")} />

			{resultsQuery.isLoading ? (
				<View className="py-12 items-center">
					<ActivityIndicator color={theme.tint} />
				</View>
			) : null}

			{aggregates ? (
				<View className="mt-6 rounded-3xl border border-line bg-cream p-5">
					<Text className="font-body text-sm text-ink-muted">{t("results.completed")}</Text>
					<Text className="mt-1 font-display text-3xl text-ink-primary">{aggregates.completedCount}</Text>
					<Text className="mt-4 font-body text-sm text-ink-muted">{t("results.totalScore")}</Text>
					<Text className="mt-1 font-display text-3xl text-ink-primary">{aggregates.totalScore}</Text>
					<Text className="mt-4 font-body text-sm text-ink-muted">{t("results.average")}</Text>
					<Text className="mt-1 font-display text-3xl text-ink-primary">
						{aggregates.averageScore === null ? "—" : aggregates.averageScore.toFixed(2)}
					</Text>
				</View>
			) : null}

			{resultsQuery.data?.items.length === 0 ? <EmptyState title={t("results.empty")} /> : null}

			{resultsQuery.data?.items.map((item) => (
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
		</Screen>
	);
};
