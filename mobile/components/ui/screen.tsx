import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = {
	children: ReactNode;
	scroll?: boolean;
	className?: string;
};

export const Screen = ({ children, scroll = false, className = "" }: ScreenProps) => {
	const content = scroll ? (
		<ScrollView className="flex-1" contentContainerClassName={`px-5 pb-8 ${className}`} showsVerticalScrollIndicator={false}>
			{children}
		</ScrollView>
	) : (
		<View className={`flex-1 px-5 ${className}`}>{children}</View>
	);

	return (
		<SafeAreaView className="flex-1 bg-cream-canvas" edges={["top", "left", "right"]}>
			{content}
		</SafeAreaView>
	);
};
