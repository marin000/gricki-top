import type { StoryDocument } from "../models";

export const isMainStoryAvailable = (
	story: Pick<StoryDocument, "isMain" | "status">,
): boolean => {
	return story.isMain === true && story.status === "approved";
};

export const isDailyStoryPublished = (
	story: Pick<StoryDocument, "isMain" | "status" | "publishAt">,
	now: Date = new Date(),
): boolean => {
	if (story.isMain || story.status !== "approved" || !story.publishAt) {
		return false;
	}
	return new Date(story.publishAt).getTime() <= now.getTime();
};

export const isStoryAvailable = (
	story: Pick<StoryDocument, "isMain" | "status" | "publishAt">,
	now: Date = new Date(),
): boolean => {
	if (isMainStoryAvailable(story)) {
		return true;
	}
	return isDailyStoryPublished(story, now);
};
