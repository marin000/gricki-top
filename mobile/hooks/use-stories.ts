import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { fetchStories } from "@/api";
import { useDevice } from "@/context";
import { storiesListSchema, type StorySummary } from "@/interface";
import { readStoriesCache, writeStoriesCache } from "@/utils/storage";

type StoriesList = {
	items: StorySummary[];
	nextCursor: string | null;
};

export const loadStoriesPlaceholder = async (): Promise<StoriesList | undefined> => {
	const cached = await readStoriesCache();
	if (!cached) {
		return undefined;
	}
	const parsed = storiesListSchema.safeParse({
		items: cached.items,
		nextCursor: cached.nextCursor,
	});
	return parsed.success ? parsed.data : undefined;
};

export const useStories = () => {
	const { identity } = useDevice();
	const [placeholder, setPlaceholder] = useState<StoriesList | undefined>();

	useEffect(() => {
		void loadStoriesPlaceholder().then(setPlaceholder);
	}, []);

	return useQuery({
		queryKey: ["stories", identity?.deviceId],
		enabled: Boolean(identity),
		placeholderData: placeholder,
		queryFn: async () => {
			if (!identity) {
				throw new Error("missing_identity");
			}
			const payload = await fetchStories(identity, { limit: 50 });
			await writeStoriesCache({
				updatedAt: new Date().toISOString(),
				items: payload.items,
				nextCursor: payload.nextCursor,
			});
			return payload;
		},
		staleTime: 60_000,
	});
};
