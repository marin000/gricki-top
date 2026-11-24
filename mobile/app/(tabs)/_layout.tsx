import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";

import { theme } from "@/constants";

export default function TabsLayout() {
	const { t } = useTranslation();

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: theme.tabIconSelected,
				tabBarInactiveTintColor: theme.tabIconDefault,
				tabBarStyle: {
					backgroundColor: theme.surface,
					borderTopColor: theme.line,
				},
				tabBarLabelStyle: {
					fontFamily: "DMSans_500Medium",
					fontSize: 12,
				},
			}}
		>
			<Tabs.Screen
				name="top"
				options={{
					title: t("tabs.top"),
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="time-outline" color={color as string} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="stories"
				options={{
					title: t("tabs.stories"),
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="book-outline" color={color as string} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="results"
				options={{
					title: t("tabs.results"),
					tabBarIcon: ({ color, size }) => (
						<Ionicons
							name="stats-chart-outline"
							color={color as string}
							size={size}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: t("tabs.settings"),
					tabBarIcon: ({ color, size }) => (
						<Ionicons
							name="settings-outline"
							color={color as string}
							size={size}
						/>
					),
				}}
			/>
		</Tabs>
	);
}
