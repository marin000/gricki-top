import { Modal, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { SharedValue } from "react-native-reanimated";

import { CannonScene } from "@/components";

type CannonFireOverlayProps = {
	visible: boolean;
	isFiring: boolean;
	smokeOpacity: number;
	recoil: SharedValue<number>;
	flash: SharedValue<number>;
	onClose: () => void;
};

export const CannonFireOverlay = ({
	visible,
	isFiring,
	smokeOpacity,
	recoil,
	flash,
	onClose,
}: CannonFireOverlayProps) => {
	const { t } = useTranslation();

	return (
		<Modal visible={visible} animationType="fade" presentationStyle="fullScreen" onRequestClose={onClose}>
			<View className="flex-1 bg-cream px-5 pb-10 pt-14">
				<Pressable
					accessibilityRole="button"
					onPress={onClose}
					className="h-10 w-10 items-center justify-center self-start rounded-full border border-line"
				>
					<Text className="font-display text-2xl text-ink-primary">×</Text>
				</Pressable>

				<Text className="mt-6 text-center font-display-bold text-6xl text-red">
					{t("top.fireBoom")}
				</Text>

				<View className="mt-4">
					<CannonScene
						recoil={recoil}
						flash={flash}
						smokeOpacity={smokeOpacity}
						isFiring={isFiring}
					/>
				</View>

				<View className="mt-4 items-center">
					<Text className="font-body-semibold text-[10px] uppercase tracking-[0.17em] text-red">
						{t("top.fireEyebrow")}
					</Text>
					<Text className="mt-2 text-center font-display text-4xl text-ink-primary">
						{t("top.fireTitle")}
					</Text>
				</View>

				<Pressable
					accessibilityRole="button"
					onPress={onClose}
					className="mt-auto items-center rounded-xl bg-blue px-4 py-3 active:opacity-80"
				>
					<Text className="font-body-semibold text-base text-ink-inverse">
						{t("top.fireClose")}
					</Text>
				</Pressable>
			</View>
		</Modal>
	);
};
