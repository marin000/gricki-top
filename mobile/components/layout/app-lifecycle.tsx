import type { ReactNode } from "react";

import { useAppForegroundRefresh } from "@/hooks/use-app-foreground-refresh";

export const AppLifecycle = ({ children }: { children: ReactNode }) => {
	useAppForegroundRefresh();
	return children;
};
