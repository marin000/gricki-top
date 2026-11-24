import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import { fetchProgress, markStoryProgress } from "@/api";
import { useDevice } from "@/context";
import {
	hasShownStorySheetLocally,
	markStorySheetShownLocally,
} from "@/utils/cannon-storage";

export const useDailyStorySheet = (options: {
	eligible: boolean;
	onHandled: () => void;
}) => {
	const { identity, bootstrap } = useDevice();
	const router = useRouter();
	const [visible, setVisible] = useState(false);

	const story = bootstrap?.latestPublishedContent ?? null;

	const progressQuery = useQuery({
		queryKey: ["progress", identity?.deviceId],
		enabled: Boolean(identity),
		queryFn: async () => {
			if (!identity) {
				throw new Error("missing_identity");
			}
			return fetchProgress(identity);
		},
	});

	useEffect(() => {
		if (!options.eligible || !story || !identity) {
			return;
		}

		let cancelled = false;

		void (async () => {
			const localShown = await hasShownStorySheetLocally(story.storyId);
			const serverRow = progressQuery.data?.stories.find((row) => row.storyId === story.storyId);
			const dismissed = Boolean(serverRow?.promptDismissedAt) || localShown;

			if (cancelled) {
				return;
			}

			if (dismissed) {
				await markStorySheetShownLocally(story.storyId);
				options.onHandled();
				return;
			}

			setVisible(true);
		})();

		return () => {
			cancelled = true;
		};
	}, [identity, options, progressQuery.data?.stories, story]);

	const dismiss = useCallback(async () => {
		if (!story || !identity) {
			setVisible(false);
			options.onHandled();
			return;
		}
		await markStorySheetShownLocally(story.storyId);
		try {
			await markStoryProgress(identity, story.storyId, { dismissPrompt: true });
		} catch {
			// local gate still prevents re-show this session
		}
		setVisible(false);
		options.onHandled();
	}, [identity, options, story]);

	const openStory = useCallback(async () => {
		if (!story) {
			return;
		}
		await dismiss();
		router.push(`/story/${story.storyId}`);
	}, [dismiss, router, story]);

	return {
		visible,
		story,
		dismiss,
		openStory,
	};
};
