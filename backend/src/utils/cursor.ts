export type StoryCursor = {
	publishAt: string;
	id: string;
};

export const encodeStoryCursor = (publishAt: Date, id: string): string => {
	const payload: StoryCursor = {
		publishAt: publishAt.toISOString(),
		id,
	};
	return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
};

export const decodeStoryCursor = (cursor: string): StoryCursor | null => {
	try {
		const raw = Buffer.from(cursor, "base64url").toString("utf8");
		const parsed = JSON.parse(raw) as StoryCursor;
		if (!parsed.publishAt || !parsed.id) {
			return null;
		}
		return parsed;
	} catch {
		return null;
	}
};
