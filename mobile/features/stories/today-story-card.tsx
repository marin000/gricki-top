import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { theme } from "@/constants";
import type { StorySummary } from "@/interface";

import { StoryMotif } from "./story-motif";

type TodayStoryCardProps = {
	story: StorySummary | null;
	locked: boolean;
	onRead: () => void;
};

export const TodayStoryCard = ({ story, locked, onRead }: TodayStoryCardProps) => {
	const disabled = locked || !story;

	return (
		<Pressable
			accessibilityRole="button"
			accessibilityState={{ disabled }}
			disabled={disabled}
			onPress={onRead}
			className={`mt-6 overflow-hidden rounded-2xl border border-line ${
				disabled ? "opacity-90" : "active:opacity-90"
			}`}
		>
			<View className="flex-row">
				<View className="h-[168px] w-[42%] items-center justify-center bg-metal-light px-2">
					<StoryMotif category={story?.category} />
				</View>
				<View className="h-[168px] flex-1 justify-between bg-blue px-4 py-4">
					<View>
						<Text className="font-body-semibold text-[10px] uppercase tracking-[0.14em] text-metal-light">
							{locked ? "Otključava se u 12:00" : "Današnja priča"}
						</Text>
						<Text
							className="mt-2 font-display text-2xl leading-7 text-ink-inverse"
							numberOfLines={3}
						>
							{locked || !story ? "Nova priča čeka podne" : story.title}
						</Text>
						<Text className="mt-2 font-body text-sm leading-5 text-blue-pale" numberOfLines={2}>
							{locked || !story
								? "Vrati se nakon pucnja Gričkog topa."
								: story.lead}
						</Text>
					</View>
					<View className="flex-row items-center self-start">
						{locked ? (
							<>
								<Ionicons name="lock-closed" size={14} color={theme.paper} />
								<Text className="ml-1 font-body-semibold text-sm text-ink-inverse">
									Zaključano
								</Text>
							</>
						) : (
							<Text className="font-body-semibold text-sm text-metal-light underline">
								Pročitaj priču
							</Text>
						)}
					</View>
				</View>
			</View>
		</Pressable>
	);
};
