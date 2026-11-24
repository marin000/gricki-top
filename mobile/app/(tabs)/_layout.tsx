import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import Svg, { Circle, Path } from "react-native-svg";

import { theme } from "@/constants";

const TabIcon = ({
	name,
	color,
	size,
}: {
	name: "tower" | "book" | "target" | "info";
	color: string;
	size: number;
}) => {
	const common = {
		width: size,
		height: size,
		viewBox: "0 0 24 24",
		fill: "none" as const,
	};

	if (name === "tower") {
		return (
			<Svg {...common}>
				<Path
					d="M5.5 21h13M7 21V8h10v13M6 8l2-3h8l2 3M9 5V2.8M15 5V2.8M10 11h4M10 15h4"
					stroke={color}
					strokeWidth={1.7}
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<Path
					d="M10 21v-3.5a2 2 0 0 1 4 0V21"
					stroke={color}
					strokeWidth={1.7}
					strokeLinecap="round"
				/>
			</Svg>
		);
	}

	if (name === "book") {
		return (
			<Svg {...common}>
				<Path
					d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22V5.5Z"
					stroke={color}
					strokeWidth={1.7}
				/>
				<Path
					d="M20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22V5.5Z"
					stroke={color}
					strokeWidth={1.7}
				/>
			</Svg>
		);
	}

	if (name === "target") {
		return (
			<Svg {...common}>
				<Circle cx="12" cy="12" r="8" stroke={color} strokeWidth={1.7} />
				<Circle cx="12" cy="12" r="3.5" stroke={color} strokeWidth={1.7} />
				<Path
					d="M12 2V5M22 12h-3M12 22v-3M2 12h3"
					stroke={color}
					strokeWidth={1.7}
					strokeLinecap="round"
				/>
			</Svg>
		);
	}

	return (
		<Svg {...common}>
			<Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.7} />
			<Path d="M12 11v6M12 7.2v.1" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
		</Svg>
	);
};

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
						<TabIcon name="tower" color={color as string} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="stories"
				options={{
					title: t("tabs.stories"),
					tabBarIcon: ({ color, size }) => (
						<TabIcon name="book" color={color as string} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="results"
				options={{
					title: t("tabs.results"),
					tabBarIcon: ({ color, size }) => (
						<TabIcon name="target" color={color as string} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: t("tabs.settings"),
					tabBarIcon: ({ color, size }) => (
						<TabIcon name="info" color={color as string} size={size} />
					),
				}}
			/>
		</Tabs>
	);
}
