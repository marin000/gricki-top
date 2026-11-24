import dotenv from "dotenv";

import { errorMessages } from "../constants";

dotenv.config();

const getEnv = (key: string, fallback = ""): string => {
	return process.env[key] ?? fallback;
};

const requireEnv = (key: string): string => {
	const value = process.env[key];
	if (!value) {
		throw new Error(errorMessages.missingEnv(key));
	}
	return value;
};

export const config = {
	port: Number(getEnv("PORT", "3000")),
	mongodbUri: requireEnv("MONGODB_URI"),
	mongodbDbName: getEnv("MONGODB_DB_NAME", "gricki-top"),
	nodeEnv: getEnv("NODE_ENV", "development"),
	timezone: getEnv("CONTENT_TIMEZONE", "Europe/Zagreb"),
	logLevel: getEnv("LOG_LEVEL", "info"),
	version: "1.0.0",
} as const;
