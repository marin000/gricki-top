import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";
import {
	cancelAnimation,
	Easing,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";

/** Approximate Zagreb funicular track: lower-left → upper-right (viewBox units) */
const TRACK = {
	start: { x: 42, y: 198 },
	end: { x: 320, y: 48 },
} as const;

export const useFunicularAnimation = (score: number, options?: { celebrate?: boolean }) => {
	const [showReview, setShowReview] = useState(false);
	const [reduceMotion, setReduceMotion] = useState(false);
	const [moving, setMoving] = useState(true);
	const progress = useSharedValue(0);
	const target = Math.min(1, Math.max(0, score / 5));

	useEffect(() => {
		let cancelled = false;
		void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
			if (!cancelled) {
				setReduceMotion(enabled);
			}
		});
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		cancelAnimation(progress);
		setMoving(true);

		if (reduceMotion || score === 0) {
			progress.value = target;
			setMoving(false);
			return;
		}

		progress.value = 0;
		progress.value = withTiming(target, {
			duration: 2600,
			easing: Easing.out(Easing.cubic),
		});

		const done = setTimeout(() => {
			setMoving(false);
			if (options?.celebrate && score === 5) {
				void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
			}
		}, 2600);

		return () => clearTimeout(done);
	}, [options?.celebrate, progress, reduceMotion, score, target]);

	const skipAnimation = () => {
		cancelAnimation(progress);
		progress.value = target;
		setMoving(false);
	};

	const openReview = () => {
		setShowReview(true);
	};

	return {
		progress,
		showReview,
		moving,
		target,
		track: TRACK,
		skipAnimation,
		openReview,
	};
};
