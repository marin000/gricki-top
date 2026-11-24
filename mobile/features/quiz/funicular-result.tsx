import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AccessibilityInfo, Pressable, Text, View } from "react-native";

import { Button } from "@/components";
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

export const FunicularResult = ({ result, onReview, onFinish }: FunicularResultProps) => {
	const { t } = useTranslation();
	const [progress, setProgress] = useState(0);
	const [showReview, setShowReview] = useState(false);
	const target = result.score / 5;

	useEffect(() => {
		let cancelled = false;
		void AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
			if (cancelled) {
				return;
			}
			if (reduceMotion || result.score === 0) {
				setProgress(target);
				return;
			}
			const started = Date.now();
			const duration = 2500;
			const tick = () => {
				if (cancelled) {
					return;
				}
				const elapsed = Date.now() - started;
				const next = Math.min(1, elapsed / duration) * target;
				setProgress(next);
				if (elapsed < duration) {
					requestAnimationFrame(tick);
				}
			};
			requestAnimationFrame(tick);
		});
		return () => {
			cancelled = true;
		};
	}, [result.score, target]);

	if (showReview) {
		return (
			<View className="flex-1 px-5 pb-8">
				<Text className="mt-4 font-display text-3xl text-ink-primary">{t("quiz.reviewTitle")}</Text>
				{result.answers.map((answer, index) => (
					<View key={answer.questionId} className="mt-4 rounded-2xl border border-line bg-cream p-4">
						<Text className="font-body text-xs text-ink-muted">
							{t("quiz.questionIndex", { index: index + 1 })} ·{" "}
							{answer.isCorrect ? t("quiz.correct") : t("quiz.wrong")}
						</Text>
						<Text className="mt-2 font-display text-xl text-ink-primary">{answer.prompt}</Text>
						<Text className="mt-2 font-body text-base text-ink-muted">{answer.explanation}</Text>
					</View>
				))}
				<View className="mt-6">
					<Button label={t("quiz.finish")} onPress={onFinish} />
				</View>
			</View>
		);
	}

	const cabinLeft = 8 + progress * 72;
	const cabinBottom = 12 + progress * 58;

	return (
		<View className="flex-1 px-5 pb-8">
			<Text className="mt-4 font-body-semibold text-xs uppercase tracking-widest text-red">{t("quiz.resultEyebrow")}</Text>
			<Text className="mt-2 font-display text-4xl text-ink-primary">
				{t("quiz.score", { score: result.score })}
			</Text>
			<Text className="mt-2 font-body text-base text-ink-muted">{t(messages[result.score])}</Text>

			<View className="mt-8 h-56 overflow-hidden rounded-3xl border border-line bg-blue-pale">
				<View className="absolute left-6 top-8 h-40 w-1 bg-blue" style={{ transform: [{ rotate: "-28deg" }] }} />
				<View
					className="absolute h-8 w-12 items-center justify-center rounded-md bg-red"
					style={{ left: `${cabinLeft}%`, bottom: `${cabinBottom}%` }}
				>
					<Text className="font-body-semibold text-xs text-ink-inverse">{result.score}/5</Text>
				</View>
				<Pressable accessibilityRole="button" onPress={() => setProgress(target)} className="absolute right-3 top-3">
					<Text className="font-body text-xs text-blue">{t("quiz.skip")}</Text>
				</Pressable>
			</View>

			<View className="mt-6 gap-3">
				<Button
					label={t("quiz.review")}
					onPress={() => {
						setShowReview(true);
						onReview();
					}}
					variant="secondary"
				/>
				<Button label={t("quiz.finish")} onPress={onFinish} />
			</View>
		</View>
	);
};
