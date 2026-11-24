import * as Crypto from "expo-crypto";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { fetchQuizResult, startQuizAttempt, submitQuizAnswer } from "@/api";
import { Button, EmptyState, Screen } from "@/components";
import { theme } from "@/constants";
import { useDevice } from "@/context";
import type { QuizAttempt, QuizResult } from "@/interface";

import { FunicularResult } from "./funicular-result";

type QuizFlowProps = {
	quizId: string;
};

export const QuizFlow = ({ quizId }: QuizFlowProps) => {
	const { t } = useTranslation();
	const { identity } = useDevice();
	const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
	const [result, setResult] = useState<QuizResult | null>(null);
	const [selected, setSelected] = useState<"A" | "B" | "C" | "D" | null>(null);
	const [feedback, setFeedback] = useState<QuizAttempt["confirmedAnswers"][number] | null>(null);
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

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

	const confirm = async () => {
		if (!identity || !attempt || !attempt.currentQuestion || !selected || pending) {
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
			}
		} catch {
			setError(t("quiz.submitError"));
		} finally {
			setPending(false);
		}
	};

	const goNext = () => {
		setSelected(null);
		setFeedback(null);
	};

	if (loading) {
		return (
			<Screen className="items-center justify-center">
				<ActivityIndicator color={theme.tint} />
			</Screen>
		);
	}

	if (error && !attempt) {
		return (
			<Screen>
				<EmptyState title={error} />
				<Button label={t("stories.back")} onPress={() => router.back()} variant="secondary" />
			</Screen>
		);
	}

	if (result) {
		return (
			<Screen scroll padded={false}>
				<FunicularResult result={result} onReview={() => undefined} onFinish={() => router.back()} />
			</Screen>
		);
	}

	const question = attempt?.currentQuestion;
	const questionNumber = feedback
		? attempt?.confirmedAnswers.length ?? 1
		: (attempt?.nextQuestionIndex ?? 0) + 1;

	return (
		<Screen scroll>
			<View className="mt-2 flex-row items-center justify-between">
				<Pressable onPress={() => router.back()}>
					<Text className="font-body-semibold text-blue">{t("quiz.close")}</Text>
				</Pressable>
				<Text className="font-body text-sm text-ink-muted">{t("quiz.title")}</Text>
				<Text className="font-body-semibold text-sm text-ink-primary">
					{t("quiz.progress", { index: questionNumber, total: 5 })}
				</Text>
			</View>

			<View className="mt-4 h-2 overflow-hidden rounded-full bg-cream-deep">
				<View className="h-full bg-blue" style={{ width: `${(questionNumber / 5) * 100}%` }} />
			</View>

			{question ? (
				<View className="mt-6">
					<Text className="font-body-semibold text-xs uppercase tracking-widest text-red">
						{t("quiz.questionIndex", { index: questionNumber })}
					</Text>
					<Text className="mt-2 font-display text-3xl leading-9 text-ink-primary">{question.prompt}</Text>

					<View className="mt-5 gap-3">
						{question.options.map((option) => {
							const isSelected = selected === option.id;
							const isCorrect = feedback?.correctOptionId === option.id;
							const isWrong = feedback && feedback.selectedOptionId === option.id && !feedback.isCorrect;
							const stateClass = feedback
								? isCorrect
									? "border-blue bg-blue-pale"
									: isWrong
										? "border-red bg-cream-deep"
										: "border-line bg-cream"
								: isSelected
									? "border-blue bg-cream"
									: "border-line bg-cream";

							return (
								<Pressable
									key={option.id}
									disabled={Boolean(feedback) || pending}
									onPress={() => setSelected(option.id)}
									className={`flex-row items-center rounded-2xl border px-4 py-3 ${stateClass}`}
								>
									<Text className="mr-3 font-display text-xl text-blue">{option.id}</Text>
									<Text className="flex-1 font-body-semibold text-base text-ink-primary">{option.text}</Text>
								</Pressable>
							);
						})}
					</View>

					{feedback ? (
						<View className="mt-5 rounded-2xl border border-line bg-cream-deep p-4">
							<Text className="font-body-semibold text-sm text-ink-primary">
								{feedback.isCorrect ? t("quiz.correct") : t("quiz.wrong")}
							</Text>
							<Text className="mt-2 font-body text-base text-ink-muted">{feedback.explanation}</Text>
						</View>
					) : null}
				</View>
			) : null}

			{error ? <Text className="mt-4 font-body text-sm text-red">{error}</Text> : null}

			<View className="mt-8">
				<Button
					label={
						feedback
							? attempt?.status === "completed" || questionNumber >= 5
								? t("quiz.seeResult")
								: t("quiz.next")
							: t("quiz.confirm")
					}
					onPress={() => {
						if (feedback) {
							if (attempt?.status === "completed" && identity) {
								void fetchQuizResult(identity, attempt.id).then(setResult);
								return;
							}
							goNext();
							return;
						}
						void confirm();
					}}
					disabled={(!feedback && !selected) || pending}
				/>
			</View>
		</Screen>
	);
};
