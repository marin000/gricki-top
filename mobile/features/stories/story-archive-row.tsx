import { Pressable, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { theme } from "@/constants";
import type { StorySummary } from "@/interface";

type StoryArchiveRowProps = {
	story: StorySummary;
	indexLabel: string;
	onPress: () => void;
	read?: boolean;
	kicker?: string;
};

export const StoryArchiveRow = ({
	story,
	indexLabel,
	onPress,
	read = false,
	kicker,
}: StoryArchiveRowProps) => {
	const label =
		kicker ??
		`${story.category}${read ? " · Pročitano" : ""}`;

	return (
		<Pressable
			accessibilityRole="button"
			onPress={onPress}
			className="flex-row items-center border-b border-line py-4 active:opacity-80"
		>
			<Text className="w-10 font-display text-xl text-red">{indexLabel}</Text>
			<View className="flex-1 pr-2">
				<Text className="font-body-semibold text-[10px] uppercase tracking-[0.12em] text-ink-muted">
					{label}
				</Text>
				<Text className="mt-1 font-display text-xl text-ink-primary" numberOfLines={2}>
					{story.title}
				</Text>
			</View>
			<Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
				<Path
					d="m9 5 7 7-7 7"
					stroke={theme.textMuted}
					strokeWidth={1.7}
					strokeLinecap="round"
				/>
			</Svg>
		</Pressable>
	);
};
