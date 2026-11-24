import { Modal, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { Button } from "@/components";

type DailyStorySheetProps = {
	visible: boolean;
	title: string;
	lead: string;
	onRead: () => void;
	onLater: () => void;
};

export const DailyStorySheet = ({
	visible,
	title,
	lead,
	onRead,
	onLater,
}: DailyStorySheetProps) => {
	const { t } = useTranslation();

	return (
		<Modal visible={visible} animationType="slide" transparent onRequestClose={onLater}>
			<Pressable className="flex-1 justify-end bg-ink-primary/40" onPress={onLater}>
				<Pressable
					className="rounded-t-3xl bg-cream px-5 pb-10 pt-4"
					onPress={(event) => event.stopPropagation()}
				>
					<View className="mb-4 h-1 w-12 self-center rounded-full bg-line" />
					<Text className="font-body-semibold text-xs uppercase tracking-widest text-red">
						{t("top.sheetEyebrow")}
					</Text>
					<Text className="mt-2 font-display text-3xl text-ink-primary">{title}</Text>
					<Text className="mt-3 font-body text-base leading-6 text-ink-muted">{lead}</Text>
					<View className="mt-6 gap-3">
						<Button label={t("top.sheetRead")} onPress={onRead} />
						<Button label={t("top.sheetLater")} onPress={onLater} variant="secondary" />
					</View>
				</Pressable>
			</Pressable>
		</Modal>
	);
};
