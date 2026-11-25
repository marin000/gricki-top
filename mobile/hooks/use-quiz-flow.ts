import { useQueryClient } from "@tanstack/react-query";
import * as Crypto from "expo-crypto";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { fetchQuizResult, startQuizAttempt, submitQuizAnswer } from "@/api";
import { useDevice } from "@/context";
import type { QuizAttempt, QuizResult } from "@/interface";

type OptionId = "A" | "B" | "C" | "D";
type AnswerFeedback = QuizAttempt["confirmedAnswers"][number];

export const useQuizFlow = (quizId: string) => {
	const { t } = useTranslation();
	const { identity } = useDevice();
	const queryClient = useQueryClient();
	const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
	const [result, setResult] = useState<QuizResult | null>(null);
	const [selected, setSelected] = useState<OptionId | null>(null);
	const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	const refreshStoryQuizState = async () => {
		await Promise.all([
			queryClient.invalidateQueries({ queryKey: ["story"] }),
			queryClient.invalidateQueries({
				queryKey: ["progress", identity?.deviceId],
			}),
		]);
	};

	useEffect(() => {
		let cancelled = false;

		const boot = async () => {
			if (!identity) {
				return;
			}
			try {
				const next = await startQuizAttempt(identity, quizId);
				if (cancelled) {
					return;
				}
				setAttempt(next);
				if (next.status === "completed") {
					const completed = await fetchQuizResult(identity, next.id);
					if (!cancelled) {
						setResult(completed);
					}
				}
			} catch {
				if (!cancelled) {
					setError(t("quiz.loadError"));
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		};

		void boot();

		return () => {
			cancelled = true;
		};
	}, [identity, quizId, t]);

	const handleSelectOption = (optionId: OptionId) => {
		if (feedback || pending) {
			return;
		}
		setSelected(optionId);
	};

	const handleConfirmAnswer = async () => {
		if (
			!identity ||
			!attempt ||
			!attempt.currentQuestion ||
			!selected ||
			pending
		) {
			return;
		}

		setPending(true);
		setError(null);
		const clientRequestId = Crypto.randomUUID();

		try {
			const response = await submitQuizAnswer(identity, attempt.id, {
				questionId: attempt.currentQuestion.questionId,
				selectedOptionId: selected,
				clientRequestId,
				expectedRevision: attempt.revision,
			});
			setFeedback(response.feedback);
			setAttempt(response.attempt);
			if (response.attempt.status === "completed") {
				const completed = await fetchQuizResult(identity, response.attempt.id);
				setResult(completed);
				await refreshStoryQuizState();
			}
		} catch {
			setError(t("quiz.submitError"));
		} finally {
			setPending(false);
		}
	};

	const handleGoNext = () => {
		setSelected(null);
		setFeedback(null);
	};

	const handlePrimaryAction = async () => {
		if (feedback) {
			if (attempt?.status === "completed" && identity) {
				const completed = await fetchQuizResult(identity, attempt.id);
				setResult(completed);
				await refreshStoryQuizState();
				return;
			}
			handleGoNext();
			return;
		}
		await handleConfirmAnswer();
	};

	const questionNumber = feedback
		? (attempt?.confirmedAnswers.length ?? 1)
		: (attempt?.nextQuestionIndex ?? 0) + 1;

	const primaryLabelKey = feedback
		? attempt?.status === "completed" || questionNumber >= 5
			? "quiz.seeResult"
			: "quiz.next"
		: "quiz.confirm";

	const isPrimaryDisabled = (!feedback && !selected) || pending;

	const question = feedback ?? attempt?.currentQuestion ?? null;

	return {
		attempt,
		result,
		selected,
		feedback,
		pending,
		error,
		loading,
		question,
		questionNumber,
		primaryLabelKey,
		isPrimaryDisabled,
		handleSelectOption,
		handlePrimaryAction,
	};
};
