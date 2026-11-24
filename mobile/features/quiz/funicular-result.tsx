import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

import { Button, FunicularScene } from "@/components";
import { useFunicularAnimation } from "@/hooks";
import type { QuizResult } from "@/interface";

const messages = [
	"quiz.funicular.0",
	"quiz.funicular.1",
	"quiz.funicular.2",
	"quiz.funicular.3",
	"quiz.funicular.4",
	"quiz.funicular.5",
] as const;

type FunicularResultProps = {
	result: QuizResult;
	onReview: () => void;
	onFinish: () => void;
};

export const FunicularResult = ({
	result,
	onReview,
	onFinish,
}: FunicularResultProps) => {
	const { t } = useTranslation();
	const { progress, showReview, moving, track, skipAnimation, openReview } =
		useFunicularAnimation(result.score, { celebrate: true });

	if (showReview) {
		return (
			<View className="flex-1 px-5 pb-8">
				<Text className="mt-4 font-display text-3xl text-ink-primary">
					{t("quiz.reviewTitle")}
				</Text>
				{result.answers.map((answer, index) => (
					<View
						key={answer.questionId}
						className="mt-4 rounded-2xl border border-line bg-cream p-4"
					>
						<Text className="font-body text-xs text-ink-muted">
							{t("quiz.questionIndex", { index: index + 1 })} ·{" "}
							{answer.isCorrect ? t("quiz.correct") : t("quiz.wrong")}
						</Text>
						<Text className="mt-2 font-display text-xl text-ink-primary">
							{answer.prompt}
						</Text>
						<Text className="mt-2 font-body text-base text-ink-muted">
							{answer.explanation}
						</Text>
					</View>
				))}
				<View className="mt-6">
					<Button label={t("quiz.finish")} onPress={onFinish} />
				</View>
			</View>
		);
	}

	const arrivalNote =
		result.score === 5
			? t("quiz.funicularArrivalBell")
			: t("quiz.funicularProgress", { percent: result.score * 20 });

	return (
		<View className="flex-1 px-5 pb-8">
			<Text className="mt-4 text-center font-body-semibold text-xs uppercase tracking-widest text-red">
				{t("quiz.resultEyebrowToday")}
			</Text>
			<Text className="mt-2 text-center font-display text-5xl text-blue">
				{result.score}
				<Text className="font-display text-5xl text-red">/5</Text>
			</Text>
			<Text className="mt-2 text-center font-body italic text-base text-blue">
				{t(messages[result.score])}
			</Text>

			<FunicularScene
				progress={progress}
				track={track}
				score={result.score}
				skipLabel={t("quiz.skip")}
				bellLabel={t("quiz.funicularBell")}
				arrivalNote={arrivalNote}
				moving={moving}
				onSkip={skipAnimation}
			/>

			<View className="mt-6 flex-row items-stretch gap-3">
				<View className="min-w-0 flex-1">
					<Button
						label={t("quiz.review")}
						onPress={() => {
							openReview();
							onReview();
						}}
						variant="secondary"
					/>
				</View>
				<View className="min-w-0 flex-1">
					<Button label={t("quiz.finish")} onPress={onFinish} />
				</View>
			</View>
		</View>
	);
};
