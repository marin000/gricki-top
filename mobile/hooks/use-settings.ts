import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Crypto from "expo-crypto";
import { useState } from "react";

import { fetchProgress, patchSettings } from "@/api";
import { useDevice } from "@/context";
import type { DeviceSettings, Progress } from "@/interface";
import {
	clearSettingsOutbox,
	enqueueOutbox,
	readSettingsCache,
	writeSettingsCache,
} from "@/utils/storage";

const defaultSettings = (): DeviceSettings => ({
	soundEnabled: true,
	hapticsEnabled: true,
	reminderEnabled: false,
	reminderLeadMinutes: 1,
});

const progressKey = (deviceId: string | undefined) =>
	["progress", deviceId] as const;

export const useSettings = () => {
	const { identity, bootstrap } = useDevice();
	const queryClient = useQueryClient();
	const key = progressKey(identity?.deviceId);
	const [optimisticPatch, setOptimisticPatch] =
		useState<Partial<DeviceSettings> | null>(null);

	const progressQuery = useQuery({
		queryKey: key,
		enabled: Boolean(identity),
		queryFn: async () => {
			if (!identity) {
				throw new Error("missing_identity");
			}
			const progress = await fetchProgress(identity);
			if (progress.settings) {
				await writeSettingsCache(progress.settings);
			}
			return progress;
		},
	});

	const serverSettings =
		progressQuery.data?.settings ?? bootstrap?.settings ?? defaultSettings();
	const settings: DeviceSettings = {
		...serverSettings,
		...optimisticPatch,
	};

	const patchMutation = useMutation({
		mutationFn: async (patch: Partial<DeviceSettings>) => {
			if (!identity) {
				throw new Error("missing_identity");
			}

			const baseline =
				queryClient.getQueryData<Progress>(key)?.settings ??
				bootstrap?.settings ??
				defaultSettings();
			const next = { ...baseline, ...patch };
			await writeSettingsCache(next);

			const clientRequestId = Crypto.randomUUID();
			try {
				const result = await patchSettings(identity, patch);
				await clearSettingsOutbox();
				return result;
			} catch {
				await enqueueOutbox({
					id: clientRequestId,
					type: "settings",
					payload: { ...patch, clientRequestId },
				});
				return { settings: next };
			}
		},
		onMutate: async (patch) => {
			setOptimisticPatch((current) => ({ ...current, ...patch }));
			await queryClient.cancelQueries({ queryKey: key });
		},
		onSuccess: async (result) => {
			await writeSettingsCache(result.settings);
			queryClient.setQueryData<Progress>(key, (current) => ({
				stories: current?.stories ?? [],
				quizzes: current?.quizzes ?? [],
				settings: result.settings,
			}));
			setOptimisticPatch(null);
		},
		onError: () => {
			setOptimisticPatch(null);
		},
	});

	return {
		settings,
		isLoading: progressQuery.isLoading,
		patchMutation,
		loadCachedSettings: readSettingsCache<DeviceSettings>,
	};
};
