import { Modal, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

type ChallengeInfoModalProps = {
	visible: boolean;
	seconds: number;
	beforeWindow: boolean;
	onClose: () => void;
};

export const ChallengeInfoModal = ({
	visible,
	seconds,
	beforeWindow,
	onClose,
}: ChallengeInfoModalProps) => {
	const { t } = useTranslation();

	return (
		<Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
			<Pressable className="flex-1 justify-center bg-ink-primary/45 px-6" onPress={onClose}>
				<Pressable
					className="rounded-3xl border border-line bg-cream px-5 py-6"
					onPress={(event) => event.stopPropagation()}
				>
					<Text className="font-body-semibold text-[10px] uppercase tracking-[0.17em] text-red">
						{t("top.challengeInfoEyebrow")}
					</Text>
					<Text className="mt-2 font-display text-3xl text-ink-primary">
						{t("top.challengeInfoTitle")}
					</Text>
					<Text className="mt-3 font-body text-base leading-6 text-ink-muted">
						{beforeWindow
							? t("top.challengeInfoBefore", { seconds })
							: t("top.challengeInfoAfter", { seconds })}
					</Text>
					<Pressable
						accessibilityRole="button"
						onPress={onClose}
						className="mt-6 items-center rounded-xl bg-blue px-4 py-3 active:opacity-80"
					>
						<Text className="font-body-semibold text-base text-ink-inverse">
							{t("top.challengeInfoClose")}
						</Text>
					</Pressable>
				</Pressable>
			</Pressable>
		</Modal>
	);
};
