import { useTranslation } from "react-i18next";
import { Text } from "react-native";

import { EmptyState, Screen } from "@/components";

export default function ResultsScreen() {
	const { t } = useTranslation();

	return (
		<Screen>
			<Text className="mt-4 font-display text-3xl text-ink-primary">{t("results.title")}</Text>
			<EmptyState title={t("results.empty")} />
		</Screen>
	);
}
