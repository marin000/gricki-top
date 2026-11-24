import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { theme } from "@/constants";
import type { StorySummary } from "@/interface";

type StoryArchiveRowProps = {
	story: StorySummary;
	indexLabel: string;
	onPress: () => void;
	read?: boolean;
};

export const StoryArchiveRow = ({ story, indexLabel, onPress, read = false }: StoryArchiveRowProps) => {
	return (
		<Pressable
			accessibilityRole="button"
			onPress={onPress}
			className="mb-2 flex-row items-center rounded-2xl border border-line bg-cream px-4 py-3 active:opacity-80"
		>
			<Text className="w-10 font-display text-xl text-blue">{indexLabel}</Text>
			<View className="flex-1 pr-2">
				<Text className="font-body text-xs text-ink-muted">
					Dan {story.dayNumber}
					{read ? " · Pročitano" : ""}
					{` · ${story.category}`}
				</Text>
				<Text className="mt-1 font-display text-xl text-ink-primary" numberOfLines={2}>
					{story.title}
				</Text>
			</View>
			<Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
		</Pressable>
	);
};
