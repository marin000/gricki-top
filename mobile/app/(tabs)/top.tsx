import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

import { Screen } from "@/components";
import { useDevice } from "@/context";

export default function TopScreen() {
	const { t } = useTranslation();
	const { bootstrap, clockSync, isOnline, error } = useDevice();

	return (
		<Screen scroll>
			<Text className="mt-4 font-display-bold text-4xl text-blue">
				{t("appName")}
			</Text>
			<Text className="mt-2 font-display text-3xl text-ink-primary">
				{t("top.title")}
			</Text>
			<Text className="mt-3 font-body text-base text-ink-muted">
				{t("top.subtitle")}
			</Text>

			<View className="mt-8 rounded-2xl bg-cream p-4 border border-line">
				{bootstrap ? (
					<>
						<Text className="font-body-semibold text-ink-primary">
							{t("top.bootstrapOk")}
						</Text>
						<Text className="mt-2 font-body text-sm text-ink-muted">
							{bootstrap.todayLocalDate} · {bootstrap.timezone}
						</Text>
						<Text className="mt-1 font-body text-sm text-ink-muted">
							Podne: {bootstrap.todayNoonAt}
						</Text>
						<Text className="mt-1 font-body text-sm text-ink-muted">
							Objavljeno dana: {bootstrap.latestPublishedDay}
							{bootstrap.contentStartDate
								? ` · start ${bootstrap.contentStartDate}`
								: " · seed još nije postavljen"}
						</Text>
						{clockSync ? (
							<Text className="mt-1 font-body text-sm text-ink-muted">
								Offset sata: {Math.round(clockSync.offsetMs)} ms · RTT{" "}
								{clockSync.rttMs} ms
							</Text>
						) : null}
					</>
				) : (
					<Text className="font-body text-ink-muted">
						{isOnline ? t("top.bootstrapPending") : t("top.bootstrapError")}
					</Text>
				)}
				{error ? (
					<Text className="mt-2 font-body text-sm text-red">{error}</Text>
				) : null}
			</View>
		</Screen>
	);
}
