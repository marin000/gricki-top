import {
	quizAttemptSchema,
	quizAnswerResponseSchema,
	quizResultSchema,
	quizResultsListSchema,
	type QuizAttempt,
	type QuizResult,
	type QuizResultsList,
} from "@/interface";
import type { DeviceIdentity } from "@/utils";

import { apiRequest } from "./client";

export const startQuizAttempt = async (identity: DeviceIdentity, quizId: string): Promise<QuizAttempt> => {
	const payload = await apiRequest<unknown>(`/v1/quizzes/${quizId}/attempt`, {
		method: "POST",
		identity,
	});
	return quizAttemptSchema.parse(payload);
};

export const fetchQuizAttempt = async (identity: DeviceIdentity, attemptId: string): Promise<QuizAttempt> => {
	const payload = await apiRequest<unknown>(`/v1/me/quiz-attempts/${attemptId}`, { identity });
	return quizAttemptSchema.parse(payload);
};

export const submitQuizAnswer = async (
	identity: DeviceIdentity,
	attemptId: string,
	body: {
		questionId: string;
		selectedOptionId: "A" | "B" | "C" | "D";
		clientRequestId: string;
		expectedRevision: number;
	},
) => {
	const payload = await apiRequest<unknown>(`/v1/me/quiz-attempts/${attemptId}/answers`, {
		method: "POST",
		identity,
		body,
	});
	return quizAnswerResponseSchema.parse(payload);
};

export const fetchQuizResult = async (identity: DeviceIdentity, attemptId: string): Promise<QuizResult> => {
	const payload = await apiRequest<unknown>(`/v1/me/quiz-attempts/${attemptId}/result`, { identity });
	return quizResultSchema.parse(payload);
};

export const fetchQuizResults = async (identity: DeviceIdentity): Promise<QuizResultsList> => {
	const payload = await apiRequest<unknown>("/v1/me/results?type=quiz&limit=20", { identity });
	return quizResultsListSchema.parse(payload);
};
