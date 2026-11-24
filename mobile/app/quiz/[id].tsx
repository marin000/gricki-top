import { useLocalSearchParams } from "expo-router";

import { QuizFlow } from "@/features";

export default function QuizScreen() {
	const params = useLocalSearchParams<{ id: string }>();
	const quizId = Array.isArray(params.id) ? params.id[0] : params.id;
	return <QuizFlow quizId={quizId ?? ""} />;
}
