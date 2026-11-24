import { Text, View } from "react-native";

type SectionHeaderProps = {
	title: string;
	meta?: string;
};

export const SectionHeader = ({ title, meta }: SectionHeaderProps) => {
	return (
		<View className="mt-8 mb-3 flex-row items-end justify-between">
			<Text className="font-body-semibold text-sm uppercase tracking-wide text-ink-muted">{title}</Text>
			{meta ? <Text className="font-body text-sm text-ink-muted">{meta}</Text> : null}
		</View>
	);
};
