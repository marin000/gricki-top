import type { ReactNode } from "react";

import { useAppForegroundRefresh } from "@/hooks";

export const AppLifecycle = ({ children }: { children: ReactNode }) => {
	useAppForegroundRefresh();
	return children;
};
