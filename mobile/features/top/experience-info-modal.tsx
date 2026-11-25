import { useTranslation } from "react-i18next";
import { Modal, Pressable, Text } from "react-native";

type ExperienceInfoModalProps = {
	visible: boolean;
	noonPassed: boolean;
	onClose: () => void;
};

export const ExperienceInfoModal = ({
	visible,
	noonPassed,
	onClose,
}: ExperienceInfoModalProps) => {
	const { t } = useTranslation();

	return (
		<Modal
			visible={visible}
			animationType="fade"
			transparent
			onRequestClose={onClose}
		>
			<Pressable
				className="flex-1 justify-center bg-ink-primary/45 px-6"
				onPress={onClose}
			>
				<Pressable
					className="rounded-3xl border border-line bg-cream px-5 py-6"
					onPress={(event) => event.stopPropagation()}
				>
					<Text className="font-body-semibold text-[10px] uppercase tracking-[0.17em] text-red">
						{t("top.experienceInfoEyebrow")}
					</Text>
					<Text className="mt-2 font-display text-3xl text-ink-primary">
						{noonPassed
							? t("top.experienceInfoTitleAfter")
							: t("top.experienceInfoTitle")}
					</Text>
					<Text className="mt-3 font-body text-base leading-6 text-ink-muted">
						{noonPassed
							? t("top.experienceInfoAfter")
							: t("top.experienceInfoBefore")}
					</Text>
					<Pressable
						accessibilityRole="button"
						onPress={onClose}
						className="mt-6 items-center rounded-xl bg-blue px-4 py-3 active:opacity-80"
					>
						<Text className="font-body-semibold text-base text-ink-inverse">
							{t("top.experienceInfoClose")}
						</Text>
					</Pressable>
				</Pressable>
			</Pressable>
		</Modal>
	);
};
