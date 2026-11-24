import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import { AccessibilityInfo, NativeModules } from "react-native";
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

type SoundHandle = {
	setPositionAsync: (positionMillis: number) => Promise<unknown>;
	playAsync: () => Promise<unknown>;
	unloadAsync: () => Promise<unknown>;
};

/** Skip expo-av entirely when native binary is missing (Expo Go mismatch / web). */
const isExpoAvAvailable = (): boolean =>
	Boolean(NativeModules.ExponentAV || NativeModules.ExpoAV);

const loadCannonSound = async (): Promise<SoundHandle | null> => {
	if (!isExpoAvAvailable()) {
		return null;
	}

	try {
		const { Audio } = await import("expo-av");
		await Audio.setAudioModeAsync({
			playsInSilentModeIOS: true,
			allowsRecordingIOS: false,
			staysActiveInBackground: false,
		});
		const { sound } = await Audio.Sound.createAsync(
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			require("../assets/cannon-boom.mp3"),
			{ volume: 0.85 },
		);
		return sound;
	} catch {
		return null;
	}
};

export const useCannonFx = (settings: DeviceSettings) => {
	const soundRef = useRef<SoundHandle | null>(null);
	const [isFiring, setIsFiring] = useState(false);
	const [smokeOpacity, setSmokeOpacity] = useState(0);
	const recoil = useSharedValue(0);
	const flash = useSharedValue(0);

	useEffect(() => {
		let cancelled = false;

		void (async () => {
			const sound = await loadCannonSound();
			if (cancelled) {
				await sound?.unloadAsync();
				return;
			}
			soundRef.current = sound;
		})();

		return () => {
			cancelled = true;
			void soundRef.current?.unloadAsync();
			soundRef.current = null;
		};
	}, []);

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

			if (settings.soundEnabled && soundRef.current) {
				try {
					await soundRef.current.setPositionAsync(0);
					await soundRef.current.playAsync();
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
		[flash, recoil, settings.hapticsEnabled, settings.soundEnabled],
	);

	return {
		fire,
		isFiring,
		smokeOpacity,
		recoil,
		flash,
	};
};
