import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Crypto from "expo-crypto";

import { fetchStory, markStoryProgress } from "@/api";
import { useDevice } from "@/context";
import { enqueueOutbox } from "@/utils/storage";

export const useStory = (storyId: string) => {
	const { identity } = useDevice();
	const queryClient = useQueryClient();

	const storyQuery = useQuery({
		queryKey: ["story", identity?.deviceId, storyId],
		enabled: Boolean(identity) && Boolean(storyId),
		queryFn: async () => {
			if (!identity) {
				throw new Error("missing_identity");
			}
			return fetchStory(identity, storyId);
		},
	});

	const markReadMutation = useMutation({
		mutationFn: async () => {
			if (!identity) {
				throw new Error("missing_identity");
			}
			const clientRequestId = Crypto.randomUUID();
			try {
				return await markStoryProgress(identity, storyId, {
					markRead: true,
					clientRequestId,
				});
			} catch (error) {
				await enqueueOutbox({
					id: clientRequestId,
					type: "story-progress",
					payload: { storyId, markRead: true, clientRequestId },
				});
				throw error;
			}
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["story", identity?.deviceId, storyId],
			});
			await queryClient.invalidateQueries({
				queryKey: ["stories", identity?.deviceId],
			});
			await queryClient.invalidateQueries({
				queryKey: ["progress", identity?.deviceId],
			});
		},
	});

	return {
		storyQuery,
		markReadMutation,
	};
};
