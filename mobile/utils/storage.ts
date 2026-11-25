import AsyncStorage from "@react-native-async-storage/async-storage";

const STORIES_CACHE_KEY = "gricki.cache.stories.v1";
const SETTINGS_CACHE_KEY = "gricki.cache.settings.v1";
const OUTBOX_KEY = "gricki.outbox.v1";

export type CachedStoriesPayload = {
	updatedAt: string;
	items: unknown[];
	nextCursor: string | null;
};

export type OutboxItem = {
	id: string;
	type: "story-progress" | "settings" | "timing";
	payload: Record<string, unknown>;
	createdAt: string;
};

export const readStoriesCache =
	async (): Promise<CachedStoriesPayload | null> => {
		const raw = await AsyncStorage.getItem(STORIES_CACHE_KEY);
		if (!raw) {
			return null;
		}
		try {
			return JSON.parse(raw) as CachedStoriesPayload;
		} catch {
			return null;
		}
	};

export const writeStoriesCache = async (
	payload: CachedStoriesPayload,
): Promise<void> => {
	await AsyncStorage.setItem(STORIES_CACHE_KEY, JSON.stringify(payload));
};

export const readSettingsCache = async <T>(): Promise<T | null> => {
	const raw = await AsyncStorage.getItem(SETTINGS_CACHE_KEY);
	if (!raw) {
		return null;
	}
	try {
		return JSON.parse(raw) as T;
	} catch {
		return null;
	}
};

export const writeSettingsCache = async (settings: unknown): Promise<void> => {
	await AsyncStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(settings));
};

export const readOutbox = async (): Promise<OutboxItem[]> => {
	const raw = await AsyncStorage.getItem(OUTBOX_KEY);
	if (!raw) {
		return [];
	}
	try {
		return JSON.parse(raw) as OutboxItem[];
	} catch {
		return [];
	}
};

export const enqueueOutbox = async (
	item: Omit<OutboxItem, "createdAt">,
): Promise<void> => {
	const current = await readOutbox();
	const withoutSameType =
		item.type === "settings"
			? current.filter((queued) => queued.type !== "settings")
			: current;
	const next = [
		...withoutSameType,
		{ ...item, createdAt: new Date().toISOString() },
	];
	await AsyncStorage.setItem(OUTBOX_KEY, JSON.stringify(next));
};

export const writeOutbox = async (items: OutboxItem[]): Promise<void> => {
	await AsyncStorage.setItem(OUTBOX_KEY, JSON.stringify(items));
};

export const clearSettingsOutbox = async (): Promise<void> => {
	const current = await readOutbox();
	await writeOutbox(current.filter((item) => item.type !== "settings"));
};

export const clearLocalAppData = async (): Promise<void> => {
	const keys = await AsyncStorage.getAllKeys();
	const grickiKeys = keys.filter((key) => key.startsWith("gricki."));
	if (grickiKeys.length > 0) {
		await AsyncStorage.multiRemove(grickiKeys);
	}
};
