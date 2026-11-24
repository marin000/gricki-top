import { storiesListSchema, storyDetailSchema, type StoryDetail, type StorySummary } from "@/interface";
import type { DeviceIdentity } from "@/utils/device-identity";

import { apiRequest } from "./client";

export const fetchStories = async (
	identity: DeviceIdentity,
	options: { cursor?: string; limit?: number } = {},
): Promise<{ items: StorySummary[]; nextCursor: string | null }> => {
	const params = new URLSearchParams();
	if (options.cursor) {
		params.set("cursor", options.cursor);
	}
	if (options.limit) {
		params.set("limit", String(options.limit));
	}
	const query = params.toString();
	const payload = await apiRequest<unknown>(`/v1/stories${query ? `?${query}` : ""}`, { identity });
	return storiesListSchema.parse(payload);
};

export const fetchMainStory = async (identity: DeviceIdentity): Promise<StoryDetail> => {
	const payload = await apiRequest<unknown>("/v1/stories/main", { identity });
	return storyDetailSchema.parse(payload);
};

export const fetchStory = async (identity: DeviceIdentity, storyId: string): Promise<StoryDetail> => {
	const payload = await apiRequest<unknown>(`/v1/stories/${storyId}`, { identity });
	return storyDetailSchema.parse(payload);
};
