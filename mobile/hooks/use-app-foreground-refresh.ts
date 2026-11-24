import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { useDevice } from "@/context";
import { flushOutbox } from "@/utils/outbox-flush";

export const useAppForegroundRefresh = () => {
	const queryClient = useQueryClient();
	const { identity } = useDevice();
	const appState = useRef(AppState.currentState);

	useEffect(() => {
		const onChange = (next: AppStateStatus) => {
			const previous = appState.current ?? "active";
			const wasBackground = /inactive|background/.test(previous);
			if (wasBackground && next === "active") {
				void flushOutbox(identity);
				void queryClient.invalidateQueries({ queryKey: ["stories"] });
				void queryClient.invalidateQueries({ queryKey: ["story"] });
				void queryClient.invalidateQueries({ queryKey: ["progress"] });
				void queryClient.invalidateQueries({ queryKey: ["bootstrap"] });
			}
			appState.current = next;
		};

		const subscription = AppState.addEventListener("change", onChange);
		return () => subscription.remove();
	}, [identity, queryClient]);

	useEffect(() => {
		void flushOutbox(identity);
	}, [identity]);
};
