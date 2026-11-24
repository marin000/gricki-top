import { Text, View } from "react-native";

type EmptyStateProps = {
	title: string;
	description?: string;
};

export const EmptyState = ({ title, description }: EmptyStateProps) => {
	return (
		<View className="items-center justify-center px-6 py-12">
			<Text className="font-display text-2xl text-ink-primary text-center">
				{title}
			</Text>
			{description ? (
				<Text className="mt-2 font-body text-base text-ink-muted text-center">
					{description}
				</Text>
			) : null}
		</View>
	);
};
