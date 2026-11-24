import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, View } from "react-native";

import { AppHeader, EmptyState, Screen } from "@/components";
import { theme } from "@/constants";
import { useDevice } from "@/context";
import { useStories } from "@/hooks";

import { StoryArchiveRow } from "./story-archive-row";
import { TodayStoryCard } from "./today-story-card";

export const StoriesArchive = () => {
	const { t } = useTranslation();
	const { bootstrap, isOnline } = useDevice();
	const storiesQuery = useStories();

	const items = storiesQuery.data?.items ?? [];
	const latest = items[0] ?? null;
	const archive = items.slice(1);
	const locked = !latest;

	const openStory = (storyId: string) => {
		router.push(`/story/${storyId}`);
	};

	return (
		<Screen scroll>
			<AppHeader eyebrow={t("stories.headerEyebrow")} />

			<View className="mt-5">
				<Text className="font-body-semibold text-[10px] uppercase tracking-[0.17em] text-red">
					{t("stories.eyebrow")}
				</Text>
				<Text className="mt-2 font-display text-3xl leading-9 text-ink-primary">
					{t("stories.headline")}
				</Text>
				<Text className="mt-3 font-body text-base leading-6 text-ink-muted">
					{t("stories.subtitle")}
				</Text>
			</View>

			{storiesQuery.isLoading && items.length === 0 ? (
				<View className="items-center py-12">
					<ActivityIndicator color={theme.tint} />
				</View>
			) : null}

			{storiesQuery.isError && items.length === 0 ? (
				<EmptyState
					title={t("stories.loadError")}
					description={isOnline ? undefined : t("top.bootstrapError")}
				/>
			) : null}

			<TodayStoryCard
				story={latest}
				locked={locked}
				onRead={() => {
					if (latest) {
						openStory(latest.id);
					}
				}}
			/>

			<View className="mt-8 min-h-[38px] flex-row items-center justify-between border-b border-line">
				<Text className="font-body-semibold text-[9px] uppercase tracking-[0.16em] text-ink-muted">
					{t("stories.archiveHeading")}
				</Text>
				<Text className="font-body-semibold text-[9px] uppercase tracking-[0.12em] text-ink-muted">
					{archive.length > 0
						? t("stories.archiveCount", { count: archive.length })
						: bootstrap?.latestPublishedDay
							? t("stories.archiveCount", { count: Math.max(0, bootstrap.latestPublishedDay - 1) })
							: ""}
				</Text>
			</View>

			{archive.length === 0 && !storiesQuery.isLoading ? (
				<EmptyState title={t("stories.archiveEmpty")} />
			) : null}

			{archive.map((story, index) => (
				<StoryArchiveRow
					key={story.id}
					story={story}
					indexLabel={String(index + 1).padStart(2, "0")}
					kicker={
						index === 0
							? t("stories.yesterdayKicker")
							: `${t("stories.dayLabel", { day: story.dayNumber })} · ${story.category}`
					}
					onPress={() => openStory(story.id)}
				/>
			))}
		</Screen>
	);
};
