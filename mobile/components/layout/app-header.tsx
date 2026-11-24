import { Text, View } from "react-native";

import { BrandMark } from "@/components/ui/brand-mark";

type AppHeaderProps = {
	eyebrow: string;
};

export const AppHeader = ({ eyebrow }: AppHeaderProps) => {
	return (
		<View className="mt-2 flex-row items-center justify-between">
			<BrandMark />
			<Text className="font-body-semibold text-[10px] uppercase tracking-[0.13em] text-ink-muted">
				{eyebrow}
			</Text>
		</View>
	);
};
