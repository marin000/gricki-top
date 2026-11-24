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
	rateLimit: {
		registerPerHour: Number(getEnv("RATE_LIMIT_REGISTER_PER_HOUR", "10")),
		readPerMinute: Number(getEnv("RATE_LIMIT_READ_PER_MINUTE", "120")),
		answersPerMinute: Number(getEnv("RATE_LIMIT_ANSWERS_PER_MINUTE", "30")),
	},
} as const;
