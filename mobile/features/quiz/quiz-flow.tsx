import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { Button, EmptyState, Screen } from "@/components";
import { theme } from "@/constants";
import { useQuizFlow } from "@/hooks";

import { FunicularResult } from "./funicular-result";

type QuizFlowProps = {
	quizId: string;
};

export const QuizFlow = ({ quizId }: QuizFlowProps) => {
	const { t } = useTranslation();
	const {
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
	} = useQuizFlow(quizId);

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
							const isWrong = Boolean(feedback && feedback.selectedOptionId === option.id && !feedback.isCorrect);
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
									onPress={() => handleSelectOption(option.id)}
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
					label={t(primaryLabelKey)}
					onPress={() => void handlePrimaryAction()}
					disabled={isPrimaryDisabled}
				/>
			</View>
		</Screen>
	);
};
