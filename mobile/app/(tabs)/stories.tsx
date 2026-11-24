import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, View } from "react-native";

import { fetchStories } from "@/api";
import { EmptyState, Screen } from "@/components";
import { theme } from "@/constants";
import { useDevice } from "@/context";

export default function StoriesScreen() {
	const { t } = useTranslation();
	const { identity, isOnline } = useDevice();

	const storiesQuery = useQuery({
		queryKey: ["stories", identity?.deviceId],
		enabled: Boolean(identity),
		queryFn: async () => {
			if (!identity) {
				throw new Error("missing_identity");
			}
			return fetchStories(identity, { limit: 20 });
		},
	});

	return (
		<Screen scroll>
			<Text className="mt-4 font-display text-3xl text-ink-primary">
				{t("stories.title")}
			</Text>

			{storiesQuery.isLoading ? (
				<View className="py-12 items-center">
					<ActivityIndicator color={theme.tint} />
				</View>
			) : null}

			{storiesQuery.isError ? (
				<EmptyState
					title={t("stories.loadError")}
					description={isOnline ? undefined : t("top.bootstrapError")}
				/>
			) : null}

			{storiesQuery.data?.items.length === 0 ? (
				<EmptyState title={t("stories.empty")} />
			) : null}

			{storiesQuery.data?.items.map((story) => (
				<View
					key={story.id}
					className="mt-4 rounded-2xl bg-cream p-4 border border-line"
				>
					<Text className="font-body text-xs text-ink-muted">
						Dan {story.dayNumber} · {story.category}
					</Text>
					<Text className="mt-1 font-display text-2xl text-ink-primary">
						{story.title}
					</Text>
					<Text className="mt-2 font-body text-base text-ink-muted">
						{story.lead}
					</Text>
				</View>
			))}
		</Screen>
	);
}
