import {
	CormorantGaramond_600SemiBold,
	CormorantGaramond_600SemiBold_Italic,
	CormorantGaramond_700Bold,
	useFonts,
} from "@expo-google-fonts/cormorant-garamond";
import {
	DMSans_400Regular,
	DMSans_500Medium,
	DMSans_600SemiBold,
} from "@expo-google-fonts/dm-sans";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

export const useRootLayoutState = () => {
	const [fontsLoaded, fontError] = useFonts({
		CormorantGaramond_600SemiBold,
		CormorantGaramond_700Bold,
		CormorantGaramond_600SemiBold_Italic,
		DMSans_400Regular,
		DMSans_500Medium,
		DMSans_600SemiBold,
	});

	useEffect(() => {
		if (fontsLoaded || fontError) {
			void SplashScreen.hideAsync();
		}
	}, [fontsLoaded, fontError]);

	return {
		isReady: fontsLoaded || Boolean(fontError),
	};
};
