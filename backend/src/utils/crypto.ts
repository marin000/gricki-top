import { createHash, timingSafeEqual } from "node:crypto";

export const hashToken = (token: string): string => {
	return createHash("sha256").update(token, "utf8").digest("hex");
};

export const tokensEqual = (leftHash: string, rightHash: string): boolean => {
	const left = Buffer.from(leftHash, "utf8");
	const right = Buffer.from(rightHash, "utf8");
	if (left.length !== right.length) {
		return false;
	}
	return timingSafeEqual(left, right);
};
