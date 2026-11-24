import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Linking, Pressable, Text, View } from "react-native";

import { Button, EmptyState, Screen } from "@/components";
import { theme } from "@/constants";
import { useStory } from "@/hooks";

type StoryReaderProps = {
	storyId: string;
};

export const StoryReader = ({ storyId }: StoryReaderProps) => {
	const { t } = useTranslation();
	const { storyQuery, markReadMutation } = useStory(storyId);
	const story = storyQuery.data;

	if (storyQuery.isLoading) {
		return (
			<Screen className="items-center justify-center">
				<ActivityIndicator color={theme.tint} />
			</Screen>
		);
	}

	if (storyQuery.isError || !story) {
		return (
			<Screen>
				<EmptyState title={t("stories.readerError")} description={t("stories.readerErrorHint")} />
				<Button label={t("stories.back")} onPress={() => router.back()} variant="secondary" />
			</Screen>
		);
	}

	const isRead = Boolean(story.readAt);

	return (
		<Screen scroll padded={false}>

			<View className="flex-row items-center justify-between px-5 pt-2">
				<Pressable
					accessibilityRole="button"
					accessibilityLabel={t("stories.back")}
					onPress={() => router.back()}
					className="h-11 w-11 items-center justify-center rounded-full border border-line bg-cream"
				>
					<Ionicons name="arrow-back" size={20} color={theme.text} />
				</Pressable>
				<Text className="font-body text-sm text-ink-muted">
					{story.dayNumber ? t("stories.dayLabel", { day: story.dayNumber }) : t("stories.mainLabel")}
				</Text>
				<Text className="font-body-semibold text-sm text-blue">{t("stories.readerBadge")}</Text>
			</View>

			<View className="mt-4 h-40 items-center justify-center bg-blue-pale">
				<Ionicons name="library-outline" size={48} color={theme.tint} />
			</View>

			<View className="px-5 pb-10 pt-6">
				<Text className="font-body-semibold text-xs uppercase tracking-widest text-red">{story.category}</Text>
				<Text className="mt-2 font-display text-4xl leading-10 text-ink-primary">{story.title}</Text>
				<Text className="mt-4 font-display-italic text-xl leading-7 text-ink-muted">{story.lead}</Text>
				<Text className="my-5 text-center text-red">✦</Text>

				{story.paragraphs.map((paragraph) => (
					<Text key={paragraph.slice(0, 24)} className="mb-4 font-body text-base leading-7 text-ink-primary">
						{paragraph}
					</Text>
				))}

				<View className="mt-4 rounded-2xl border border-line bg-cream p-4">
					<Text className="font-body-semibold text-sm text-ink-muted">{t("stories.sources")}</Text>
					{story.sources.map((source) => (
						<Pressable
							key={source.id}
							accessibilityRole="link"
							onPress={() => void Linking.openURL(source.url)}
							className="mt-3 flex-row items-center justify-between"
						>
							<View className="flex-1 pr-3">
								<Text className="font-body-semibold text-base text-ink-primary">{source.title}</Text>
								<Text className="font-body text-sm text-ink-muted">{source.publisher}</Text>
							</View>
							<Ionicons name="open-outline" size={18} color={theme.tint} />
						</Pressable>
					))}
				</View>

				{story.quiz ? (
					<View className="mt-6 rounded-2xl border border-line bg-cream-deep p-4">
						<Text className="font-body text-xs uppercase tracking-wide text-ink-muted">{t("stories.quizSoonEyebrow")}</Text>
						<Text className="mt-1 font-display text-2xl text-ink-primary">{t("stories.quizSoonTitle")}</Text>
						<Text className="mt-1 font-body text-base text-ink-muted">{t("stories.quizInviteBody")}</Text>
						<View className="mt-4">
							<Button
								label={
									story.quiz.attemptStatus === "completed"
										? t("stories.quizOpenResult")
										: story.quiz.attemptStatus === "in_progress"
											? t("stories.quizContinue")
											: t("stories.quizStart")
								}
								onPress={() => router.push(`/quiz/${story.quiz?.dailyQuizId}`)}
							/>
						</View>
					</View>
				) : (
					<View className="mt-6 rounded-2xl border border-line bg-cream-deep p-4">
						<Text className="font-body text-xs uppercase tracking-wide text-ink-muted">{t("stories.quizSoonEyebrow")}</Text>
						<Text className="mt-1 font-display text-2xl text-ink-primary">{t("stories.quizSoonTitle")}</Text>
						<Text className="mt-1 font-body text-base text-ink-muted">{t("stories.quizSoonBody")}</Text>
					</View>
				)}

				<View className="mt-6">
					<Button
						label={isRead ? t("stories.alreadyRead") : t("stories.markRead")}
						onPress={() => markReadMutation.mutate()}
						disabled={isRead || markReadMutation.isPending}
					/>
				</View>
			</View>
		</Screen>
	);
};
