import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";
import {
	cancelAnimation,
	useSharedValue,
	withSequence,
	withTiming,
} from "react-native-reanimated";

import type { DeviceSettings } from "@/interface";

type FireOptions = {
	demo?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const cannonBoomSource = require("../assets/cannon-boom.mp3");

export const useCannonFx = (settings: DeviceSettings) => {
	const player = useAudioPlayer(cannonBoomSource);
	const [isFiring, setIsFiring] = useState(false);
	const [smokeOpacity, setSmokeOpacity] = useState(0);
	const recoil = useSharedValue(0);
	const flash = useSharedValue(0);

	useEffect(() => {
		void setAudioModeAsync({
			playsInSilentMode: true,
			interruptionMode: "mixWithOthers",
		}).catch(() => {
			// audio mode unavailable in this runtime
		});
		player.volume = 0.85;
	}, [player]);

	const fire = useCallback(
		async (_options: FireOptions = {}) => {
			setIsFiring(true);
			setSmokeOpacity(1);

			const reduceMotion = await AccessibilityInfo.isReduceMotionEnabled();

			if (settings.hapticsEnabled) {
				try {
					void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
					setTimeout(() => {
						void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
					}, 120);
				} catch {
					// haptics unavailable in this runtime
				}
			}

			if (settings.soundEnabled) {
				try {
					await player.seekTo(0);
					player.play();
				} catch {
					// ignore playback errors
				}
			}

			if (reduceMotion) {
				recoil.value = 0;
				flash.value = 0;
			} else {
				cancelAnimation(recoil);
				cancelAnimation(flash);
				recoil.value = withSequence(
					withTiming(1, { duration: 80 }),
					withTiming(0, { duration: 420 }),
				);
				flash.value = withSequence(
					withTiming(1, { duration: 60 }),
					withTiming(0, { duration: 500 }),
				);
			}

			setTimeout(
				() => {
					setSmokeOpacity(0);
					setIsFiring(false);
				},
				reduceMotion ? 200 : 900,
			);
		},
		[flash, player, recoil, settings.hapticsEnabled, settings.soundEnabled],
	);

	return {
		fire,
		isFiring,
		smokeOpacity,
		recoil,
		flash,
	};
};
