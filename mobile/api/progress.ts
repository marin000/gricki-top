import {
	type DeviceSettings,
	type Progress,
	progressSchema,
	type QuizMetadata,
	quizMetadataSchema,
} from "@/interface";
import type { DeviceIdentity } from "@/utils/device-identity";

import { apiRequest } from "./client";

export const fetchProgress = async (
	identity: DeviceIdentity,
): Promise<Progress> => {
	const payload = await apiRequest<unknown>("/v1/me/progress", { identity });
	return progressSchema.parse(payload);
};

export const markStoryProgress = async (
	identity: DeviceIdentity,
	storyId: string,
	body: {
		markRead?: boolean;
		dismissPrompt?: boolean;
		clientRequestId?: string;
	},
) => {
	return apiRequest(`/v1/me/story-progress/${storyId}`, {
		method: "PUT",
		identity,
		body,
	});
};

export const patchSettings = async (
	identity: DeviceIdentity,
	settings: Partial<DeviceSettings>,
): Promise<{ settings: DeviceSettings }> => {
	return apiRequest("/v1/me/settings", {
		method: "PATCH",
		identity,
		body: settings,
	});
};

export const fetchQuizMetadata = async (
	identity: DeviceIdentity,
	quizId: string,
): Promise<QuizMetadata> => {
	const payload = await apiRequest<unknown>(`/v1/quizzes/${quizId}`, {
		identity,
	});
	return quizMetadataSchema.parse(payload);
};
