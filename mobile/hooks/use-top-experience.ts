import Constants from "expo-constants";
import * as Crypto from "expo-crypto";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { ApiError, createTimingAttempt } from "@/api";
import { useDevice } from "@/context";
import type { TimingAttempt } from "@/interface";
import { hasAutoFiredToday, markAutoFiredToday } from "@/utils/cannon-storage";
import { estimateServerNowMs } from "@/utils/clock-sync";
import {
	formatCountdown,
	formatDeltaLabel,
	getCountdownParts,
	hasPassedNoon,
	isInsideTimingWindow,
	msUntil,
	TIMING_WINDOW_MS,
} from "@/utils/noon";
import { enqueueOutbox } from "@/utils/storage";

import { useCannonFx } from "./use-cannon-fx";
import { useServerNow } from "./use-server-now";
import { useSettings } from "./use-settings";

export type TopMode = "experience" | "challenge";

export const useTopExperience = () => {
	const { identity, bootstrap, clockSync, isOnline, refreshBootstrap } =
		useDevice();
	const { settings } = useSettings();
	const { nowMs, noonMs, countdownTargetMs, localDate, offsetMs, rttMs } =
		useServerNow();
	const cannon = useCannonFx(settings);

	const [mode, setMode] = useState<TopMode>("experience");
	const [timingResult, setTimingResult] = useState<TimingAttempt | null>(null);
	const [localDeltaLabel, setLocalDeltaLabel] = useState<string | null>(null);
	const [timingError, setTimingError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [challengeArmed, setChallengeArmed] = useState(false);
	const [challengeAborted, setChallengeAborted] = useState(false);
	const [sheetEligible, setSheetEligible] = useState(false);
	const [autoFireChecked, setAutoFireChecked] = useState(false);
	const [autoFired, setAutoFired] = useState(false);
	const [fireOverlayVisible, setFireOverlayVisible] = useState(false);
	const [experienceInfoVisible, setExperienceInfoVisible] = useState(false);
	const [challengeInfoVisible, setChallengeInfoVisible] = useState(false);

	const firedRef = useRef(false);
	const tapLockedRef = useRef(false);
	const missedNoonSheetRef = useRef(false);

	const remainingMs =
		countdownTargetMs == null ? null : msUntil(countdownTargetMs, nowMs);
	const countdownLabel =
		remainingMs == null || remainingMs <= 0
			? "--:--"
			: formatCountdown(remainingMs);
	const countdownParts =
		remainingMs == null || remainingMs <= 0
			? { hours: "--", minutes: "--", seconds: "--", totalSeconds: 0 }
			: getCountdownParts(remainingMs);
	const noonPassed = noonMs != null && hasPassedNoon(nowMs, noonMs);
	const inWindow = noonMs != null && isInsideTimingWindow(nowMs, noonMs);
	const beforeWindow = noonMs != null && nowMs < noonMs - TIMING_WINDOW_MS;

	// After noon, bootstrap may still have nextNoonAt === todayNoonAt until refreshed.
	useEffect(() => {
		if (!noonPassed || countdownTargetMs != null) {
			return;
		}
		void refreshBootstrap().catch(() => undefined);
	}, [countdownTargetMs, noonPassed, refreshBootstrap]);

	useEffect(() => {
		if (!localDate) {
			return;
		}
		let cancelled = false;
		void hasAutoFiredToday(localDate).then((fired) => {
			if (!cancelled) {
				firedRef.current = fired;
				setAutoFired(fired);
				setAutoFireChecked(true);
			}
		});
		return () => {
			cancelled = true;
		};
	}, [localDate]);

	useEffect(() => {
		if (!autoFireChecked || !localDate || noonMs == null) {
			return;
		}
		if (!hasPassedNoon(nowMs, noonMs)) {
			return;
		}

		const lateBy = nowMs - noonMs;
		// Missed noon: still offer the daily story sheet on next Top visit.
		if (lateBy > 2_000) {
			if (!missedNoonSheetRef.current) {
				missedNoonSheetRef.current = true;
				setSheetEligible(true);
				void refreshBootstrap().catch(() => undefined);
			}
			return;
		}

		if (mode !== "experience" || firedRef.current) {
			return;
		}

		firedRef.current = true;
		setAutoFired(true);
		void (async () => {
			await markAutoFiredToday(localDate);
			setFireOverlayVisible(true);
			await cannon.fire();
			setSheetEligible(true);
			await refreshBootstrap().catch(() => undefined);
		})();
	}, [
		autoFireChecked,
		cannon,
		localDate,
		mode,
		noonMs,
		nowMs,
		refreshBootstrap,
	]);

	useEffect(() => {
		const onChange = (state: AppStateStatus) => {
			if (
				state !== "active" &&
				mode === "challenge" &&
				challengeArmed &&
				!tapLockedRef.current
			) {
				setChallengeArmed(false);
				setChallengeAborted(true);
			}
		};
		const sub = AppState.addEventListener("change", onChange);
		return () => sub.remove();
	}, [challengeArmed, mode]);

	const armChallenge = useCallback(() => {
		setTimingResult(null);
		setLocalDeltaLabel(null);
		setTimingError(null);
		setChallengeAborted(false);
		tapLockedRef.current = false;
		setChallengeArmed(true);
	}, []);

	const openExperienceInfo = useCallback(() => {
		setMode("experience");
		setExperienceInfoVisible(true);
	}, []);

	const closeExperienceInfo = useCallback(() => {
		setExperienceInfoVisible(false);
	}, []);

	const closeFireOverlay = useCallback(() => {
		setFireOverlayVisible(false);
	}, []);

	const openChallengeInfo = useCallback(() => {
		setChallengeInfoVisible(true);
	}, []);

	const closeChallengeInfo = useCallback(() => {
		setChallengeInfoVisible(false);
	}, []);

	const selectChallengeMode = useCallback(() => {
		if (noonMs == null) {
			openChallengeInfo();
			return;
		}
		if (isInsideTimingWindow(estimateServerNowMs(offsetMs), noonMs)) {
			setMode("challenge");
			armChallenge();
			return;
		}
		openChallengeInfo();
	}, [armChallenge, noonMs, offsetMs, openChallengeInfo]);

	useEffect(() => {
		if (!inWindow && challengeArmed) {
			setChallengeArmed(false);
		}
	}, [challengeArmed, inWindow]);

	const submitTap = useCallback(async () => {
		if (
			!identity ||
			!localDate ||
			noonMs == null ||
			tapLockedRef.current ||
			isSubmitting
		) {
			return;
		}
		if (!isInsideTimingWindow(estimateServerNowMs(offsetMs), noonMs)) {
			setTimingError(`Prozor ±${TIMING_WINDOW_MS / 1000} s je zatvoren.`);
			return;
		}

		tapLockedRef.current = true;
		setIsSubmitting(true);
		setTimingError(null);

		const clientAttemptId = Crypto.randomUUID();
		const tapClientMs = Date.now();
		const estimatedTapMs = estimateServerNowMs(offsetMs, tapClientMs);
		const deltaMs = estimatedTapMs - noonMs;
		const label = formatDeltaLabel(deltaMs);
		setLocalDeltaLabel(label);

		setFireOverlayVisible(true);
		await cannon.fire();

		const syncStatus = isOnline && clockSync ? "synced" : "unverified";
		const appVersion = Constants.expoConfig?.version ?? "1.0.0";

		try {
			const attempt = await createTimingAttempt(identity, {
				localDate,
				clientAttemptId,
				estimatedTapAt: new Date(estimatedTapMs).toISOString(),
				syncStatus,
				clockRttMs: rttMs ?? undefined,
				appVersion,
			});
			setTimingResult(attempt);
			setLocalDeltaLabel(attempt.label);
			setSheetEligible(true);
		} catch (error) {
			if (
				error instanceof ApiError &&
				error.status === 409 &&
				error.code === "TIMING_ALREADY_RECORDED"
			) {
				setTimingError("Današnji pokušaj je već zabilježen.");
			} else {
				await enqueueOutbox({
					id: clientAttemptId,
					type: "timing",
					payload: {
						localDate,
						clientAttemptId,
						estimatedTapAt: new Date(estimatedTapMs).toISOString(),
						syncStatus: "unverified",
						clockRttMs: rttMs ?? null,
						appVersion,
					},
				});
				setTimingResult({
					id: clientAttemptId,
					localDate,
					clientAttemptId,
					noonAt: new Date(noonMs).toISOString(),
					estimatedTapAt: new Date(estimatedTapMs).toISOString(),
					deltaMs,
					syncStatus: "unverified",
					clockRttMs: rttMs,
					recordedAt: new Date().toISOString(),
					label,
				});
				setSheetEligible(true);
				if (isOnline) {
					setTimingError(
						error instanceof Error ? error.message : "Slanje nije uspjelo.",
					);
				}
			}
		} finally {
			setIsSubmitting(false);
			setChallengeArmed(false);
		}
	}, [
		cannon,
		clockSync,
		identity,
		isOnline,
		isSubmitting,
		localDate,
		noonMs,
		offsetMs,
		rttMs,
	]);

	const dismissTimingResult = useCallback(() => {
		setTimingResult(null);
		setLocalDeltaLabel(null);
		setSheetEligible(true);
	}, []);

	const clearSheetEligible = useCallback(() => {
		setSheetEligible(false);
	}, []);

	return {
		mode,
		setMode,
		bootstrap,
		settings,
		nowMs,
		noonMs,
		localDate,
		countdownLabel,
		countdownParts,
		remainingMs,
		noonPassed,
		inWindow,
		beforeWindow,
		challengeArmed,
		challengeAborted,
		armChallenge,
		submitTap,
		openExperienceInfo,
		experienceInfoVisible,
		closeExperienceInfo,
		challengeInfoVisible,
		openChallengeInfo,
		closeChallengeInfo,
		fireOverlayVisible,
		closeFireOverlay,
		selectChallengeMode,
		isSubmitting,
		timingResult,
		localDeltaLabel,
		timingError,
		dismissTimingResult,
		sheetEligible,
		clearSheetEligible,
		cannon,
		refreshBootstrap,
		autoFired,
		isOnline,
	};
};
