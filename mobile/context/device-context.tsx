import Constants from "expo-constants";
import { createContext, type ReactNode, useContext, useEffect, useState } from "react";

import { fetchBootstrap, registerDevice } from "@/api";
import type { Bootstrap } from "@/interface";
import {
	loadOrCreateDeviceIdentity,
	sampleClockOffset,
	type ClockSyncResult,
	type DeviceIdentity,
} from "@/utils";

type DeviceContextValue = {
	identity: DeviceIdentity | null;
	bootstrap: Bootstrap | null;
	clockSync: ClockSyncResult | null;
	isReady: boolean;
	isOnline: boolean;
	error: string | null;
	refreshBootstrap: () => Promise<void>;
};

const DeviceContext = createContext<DeviceContextValue | null>(null);

export const DeviceProvider = ({ children }: { children: ReactNode }) => {
	const [identity, setIdentity] = useState<DeviceIdentity | null>(null);
	const [bootstrap, setBootstrap] = useState<Bootstrap | null>(null);
	const [clockSync, setClockSync] = useState<ClockSyncResult | null>(null);
	const [isReady, setIsReady] = useState(false);
	const [isOnline, setIsOnline] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const refreshBootstrap = async (): Promise<void> => {
		const current = identity ?? (await loadOrCreateDeviceIdentity());
		if (!identity) {
			setIdentity(current);
		}

		const appVersion = Constants.expoConfig?.version ?? "1.0.0";
		await registerDevice(current, appVersion);
		const [nextBootstrap, nextClock] = await Promise.all([fetchBootstrap(current), sampleClockOffset()]);
		setBootstrap(nextBootstrap);
		setClockSync(nextClock);
		setIsOnline(true);
		setError(null);
	};

	useEffect(() => {
		let cancelled = false;

		const bootstrapDevice = async () => {
			try {
				const current = await loadOrCreateDeviceIdentity();
				if (cancelled) {
					return;
				}
				setIdentity(current);

				const appVersion = Constants.expoConfig?.version ?? "1.0.0";
				await registerDevice(current, appVersion);
				const [nextBootstrap, nextClock] = await Promise.all([fetchBootstrap(current), sampleClockOffset()]);
				if (cancelled) {
					return;
				}
				setBootstrap(nextBootstrap);
				setClockSync(nextClock);
				setIsOnline(true);
				setError(null);
			} catch (bootError) {
				if (cancelled) {
					return;
				}
				setIsOnline(false);
				setError(bootError instanceof Error ? bootError.message : "bootstrap_failed");
			} finally {
				if (!cancelled) {
					setIsReady(true);
				}
			}
		};

		void bootstrapDevice();

		return () => {
			cancelled = true;
		};
	}, []);

	return (
		<DeviceContext.Provider
			value={{
				identity,
				bootstrap,
				clockSync,
				isReady,
				isOnline,
				error,
				refreshBootstrap,
			}}
		>
			{children}
		</DeviceContext.Provider>
	);
};

export const useDevice = (): DeviceContextValue => {
	const value = useContext(DeviceContext);
	if (!value) {
		throw new Error("useDevice must be used within DeviceProvider");
	}
	return value;
};
