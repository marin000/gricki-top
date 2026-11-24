import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Crypto from "expo-crypto";

import { fetchProgress, patchSettings } from "@/api";
import type { DeviceSettings } from "@/interface";
import { useDevice } from "@/context";
import { enqueueOutbox, readSettingsCache, writeSettingsCache } from "@/utils/storage";

const defaultSettings = (): DeviceSettings => ({
	soundEnabled: true,
	hapticsEnabled: true,
	reminderEnabled: false,
	reminderLeadMinutes: 1,
});

export const useSettings = () => {
	const { identity, bootstrap } = useDevice();
	const queryClient = useQueryClient();

	const progressQuery = useQuery({
		queryKey: ["progress", identity?.deviceId],
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

	const cachedOrBootstrapSettings =
		progressQuery.data?.settings ?? bootstrap?.settings ?? defaultSettings();

	const patchMutation = useMutation({
		mutationFn: async (patch: Partial<DeviceSettings>) => {
			if (!identity) {
				throw new Error("missing_identity");
			}
			const optimistic = { ...cachedOrBootstrapSettings, ...patch };
			await writeSettingsCache(optimistic);
			const clientRequestId = Crypto.randomUUID();
			try {
				return await patchSettings(identity, patch);
			} catch (error) {
				await enqueueOutbox({
					id: clientRequestId,
					type: "settings",
					payload: { ...patch, clientRequestId },
				});
				throw error;
			}
		},
		onSuccess: async (result) => {
			await writeSettingsCache(result.settings);
			await queryClient.invalidateQueries({ queryKey: ["progress", identity?.deviceId] });
		},
	});

	return {
		settings: cachedOrBootstrapSettings,
		isLoading: progressQuery.isLoading,
		patchMutation,
		loadCachedSettings: readSettingsCache<DeviceSettings>,
	};
};
