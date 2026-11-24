import type { Response } from "express";

type ApiErrorBody = {
	error: {
		code: string;
		message: string;
		requestId: string;
		details?: unknown;
	};
};

export const sendApiError = (
	res: Response,
	status: number,
	code: string,
	message: string,
	requestId: string,
	details?: unknown,
): void => {
	const body: ApiErrorBody = {
		error: {
			code,
			message,
			requestId,
			...(details === undefined ? {} : { details }),
		},
	};
	res.status(status).json(body);
};
