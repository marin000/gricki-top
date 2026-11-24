import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";

export const useAppForegroundRefresh = () => {
	const queryClient = useQueryClient();
	const appState = useRef(AppState.currentState);

	useEffect(() => {
		const onChange = (next: AppStateStatus) => {
			const previous = appState.current ?? "active";
			const wasBackground = /inactive|background/.test(previous);
			if (wasBackground && next === "active") {
				void queryClient.invalidateQueries({ queryKey: ["stories"] });
				void queryClient.invalidateQueries({ queryKey: ["story"] });
				void queryClient.invalidateQueries({ queryKey: ["progress"] });
				void queryClient.invalidateQueries({ queryKey: ["bootstrap"] });
			}
			appState.current = next;
		};

		const subscription = AppState.addEventListener("change", onChange);
		return () => subscription.remove();
	}, [queryClient]);
};
