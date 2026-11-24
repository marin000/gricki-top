import "@/utils/i18n";
import "../global.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { AppLifecycle, BootstrapGate } from "@/components";
import { theme } from "@/constants";
import { DeviceProvider } from "@/context";
import { useRootLayoutState } from "@/hooks";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
	const { isReady } = useRootLayoutState();

	if (!isReady) {
		return null;
	}

	return (
		<GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.background }}>
			<QueryClientProvider client={queryClient}>
				<DeviceProvider>
					<AppLifecycle>
						<StatusBar style="dark" />
						<BootstrapGate>
							<Stack
								screenOptions={{
									headerShown: false,
									contentStyle: { backgroundColor: theme.background },
									animation: "slide_from_right",
								}}
							>
								<Stack.Screen name="index" />
								<Stack.Screen name="(tabs)" />
								<Stack.Screen name="story/[id]" />
							</Stack>
						</BootstrapGate>
					</AppLifecycle>
				</DeviceProvider>
			</QueryClientProvider>
		</GestureHandlerRootView>
	);
}
