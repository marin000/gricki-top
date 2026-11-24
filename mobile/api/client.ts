import { apiBaseUrl } from "@/utils/config";
import {
	authorizationHeader,
	type DeviceIdentity,
} from "@/utils/device-identity";

type RequestOptions = {
	method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
	body?: unknown;
	identity?: DeviceIdentity | null;
	omitAuth?: boolean;
};

export class ApiError extends Error {
	status: number;
	code?: string;

	constructor(message: string, status: number, code?: string) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.code = code;
	}
}

export const apiRequest = async <T>(
	path: string,
	options: RequestOptions = {},
): Promise<T> => {
	const headers: Record<string, string> = {
		Accept: "application/json",
	};

	if (options.body !== undefined) {
		headers["Content-Type"] = "application/json";
	}

	if (!options.omitAuth && options.identity) {
		headers.Authorization = authorizationHeader(options.identity);
	}

	const response = await fetch(`${apiBaseUrl}${path}`, {
		method: options.method ?? "GET",
		headers,
		body: options.body === undefined ? undefined : JSON.stringify(options.body),
	});

	if (!response.ok) {
		let code: string | undefined;
		let message = `HTTP ${response.status}`;
		try {
			const payload = (await response.json()) as {
				error?: { code?: string; message?: string };
			};
			code = payload.error?.code;
			message = payload.error?.message ?? message;
		} catch {
			// ignore parse errors
		}
		throw new ApiError(message, response.status, code);
	}

	if (response.status === 204) {
		return undefined as T;
	}

	return (await response.json()) as T;
};
