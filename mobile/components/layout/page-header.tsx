import { Text, View } from "react-native";

type PageHeaderProps = {
	eyebrow: string;
	title: string;
	subtitle?: string;
};

export const PageHeader = ({ eyebrow, title, subtitle }: PageHeaderProps) => {
	return (
		<View className="mt-4">
			<Text className="font-body-semibold text-xs uppercase tracking-widest text-red">{eyebrow}</Text>
			<Text className="mt-2 font-display text-3xl leading-9 text-ink-primary">{title}</Text>
			{subtitle ? <Text className="mt-3 font-body text-base leading-6 text-ink-muted">{subtitle}</Text> : null}
		</View>
	);
};
