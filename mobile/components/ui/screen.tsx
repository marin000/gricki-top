import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = {
	children: ReactNode;
	scroll?: boolean;
	padded?: boolean;
	className?: string;
};

export const Screen = ({ children, scroll = false, padded = true, className = "" }: ScreenProps) => {
	const padClass = padded ? "px-5" : "px-0";

	const content = scroll ? (
		<ScrollView
			className="flex-1"
			contentContainerClassName={`${padClass} pb-8 ${className}`}
			showsVerticalScrollIndicator={false}
		>
			{children}
		</ScrollView>
	) : (
		<View className={`flex-1 ${padClass} ${className}`}>{children}</View>
	);

	return (
		<SafeAreaView className="flex-1 bg-cream-canvas" edges={["top", "left", "right"]}>
			{content}
		</SafeAreaView>
	);
};
