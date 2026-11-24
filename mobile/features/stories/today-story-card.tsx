import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { Button } from "@/components";
import { theme } from "@/constants";
import type { StorySummary } from "@/interface";

type TodayStoryCardProps = {
	story: StorySummary | null;
	locked: boolean;
	onRead: () => void;
};

export const TodayStoryCard = ({ story, locked, onRead }: TodayStoryCardProps) => {
	return (
		<View className="mt-6 overflow-hidden rounded-3xl border border-line bg-cream">
			<View className="h-36 items-center justify-center bg-blue-pale">
				<Ionicons name="book" size={42} color={theme.tint} />
			</View>
			<View className="p-5">
				<Text className="font-body-semibold text-xs uppercase tracking-widest text-red">
					{locked ? "Otključava se u 12:00" : "Današnja priča"}
				</Text>
				<Text className="mt-2 font-display text-3xl text-ink-primary">
					{locked || !story ? "Nova priča čeka podne" : story.title}
				</Text>
				<Text className="mt-2 font-body text-base leading-6 text-ink-muted">
					{locked || !story ? "Vrati se nakon pucnja Gričkog topa." : story.lead}
				</Text>
				<View className="mt-4">
					<Button
						label={locked ? "Zaključano" : "Pročitaj priču"}
						onPress={onRead}
						disabled={locked || !story}
						icon={locked ? <Ionicons name="lock-closed" size={16} color={theme.textInverse} /> : undefined}
					/>
				</View>
			</View>
		</View>
	);
};
