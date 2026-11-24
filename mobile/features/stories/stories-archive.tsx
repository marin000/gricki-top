import { router } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useTranslation } from "react-i18next";

import { EmptyState, PageHeader, Screen, SectionHeader } from "@/components";
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
			<PageHeader
				eyebrow={t("stories.eyebrow")}
				title={t("stories.headline")}
				subtitle={t("stories.subtitle")}
			/>

			{storiesQuery.isLoading && items.length === 0 ? (
				<View className="py-12 items-center">
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

			<SectionHeader
				title={t("stories.archiveHeading")}
				meta={
					archive.length > 0
						? t("stories.archiveCount", { count: archive.length })
						: bootstrap?.latestPublishedDay
							? undefined
							: undefined
				}
			/>

			{archive.length === 0 && !storiesQuery.isLoading ? (
				<EmptyState title={t("stories.archiveEmpty")} />
			) : null}

			{archive.map((story, index) => (
				<StoryArchiveRow
					key={story.id}
					story={story}
					indexLabel={String(index + 1).padStart(2, "0")}
					onPress={() => openStory(story.id)}
				/>
			))}
		</Screen>
	);
};
