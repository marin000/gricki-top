export const errorMessages = {
	missingEnv: (key: string) => `Missing required environment variable: ${key}`,
	invalidBody: "Invalid request body",
	unauthorized: "Installation unauthorized",
	deviceConflict: "Device already registered with a different secret",
	notFound: "Not found",
	contentNotAvailable: "Content not available",
	internal: "Internal server error",
	rateLimited: "Too many requests. Try again later.",
	missingStartDate: "Pass --start-date YYYY-MM-DD when seeding",
	invalidStartDate: "Invalid --start-date; expected YYYY-MM-DD",
} as const;

export const errorCodes = {
	VALIDATION_ERROR: "VALIDATION_ERROR",
	INSTALLATION_UNAUTHORIZED: "INSTALLATION_UNAUTHORIZED",
	DEVICE_SECRET_CONFLICT: "DEVICE_SECRET_CONFLICT",
	NOT_FOUND: "NOT_FOUND",
	CONTENT_NOT_AVAILABLE: "CONTENT_NOT_AVAILABLE",
	RATE_LIMITED: "RATE_LIMITED",
	SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
} as const;

export const infoMessages = {
	serverStarted: "Grički top API started",
	databaseConnected: "MongoDB connected",
	databaseFailed: "MongoDB connection failed",
} as const;
