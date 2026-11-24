import type { ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";

import { theme } from "@/constants";
import { useDevice } from "@/context";

export const BootstrapGate = ({ children }: { children: ReactNode }) => {
	const { isReady } = useDevice();

	if (!isReady) {
		return (
			<View className="flex-1 items-center justify-center bg-cream-canvas">
				<ActivityIndicator color={theme.tint} />
			</View>
		);
	}

	return children;
};
