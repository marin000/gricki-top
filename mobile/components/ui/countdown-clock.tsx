import { Text, View } from "react-native";

import type { CountdownParts } from "@/utils/noon";

type CountdownClockProps = {
	parts: CountdownParts;
	eyebrow: string;
	hint: string;
};

const Unit = ({ value, label }: { value: string; label: string }) => (
	<View className="min-w-[68px] items-center">
		<Text className="font-display text-5xl leading-[46px] text-blue">{value}</Text>
		<Text className="mt-1 font-body-semibold text-[8px] uppercase tracking-[0.18em] text-ink-muted">
			{label}
		</Text>
	</View>
);

export const CountdownClock = ({ parts, eyebrow, hint }: CountdownClockProps) => {
	return (
		<View className="mt-1 items-center">
			<Text className="font-body-semibold text-[10px] uppercase tracking-[0.17em] text-red">
				{eyebrow}
			</Text>
			<View className="mt-1 flex-row items-start justify-center">
				<Unit value={parts.hours} label="SATI" />
				<Text className="px-1 pt-0.5 font-display text-[34px] leading-[46px] text-red">:</Text>
				<Unit value={parts.minutes} label="MIN" />
				<Text className="px-1 pt-0.5 font-display text-[34px] leading-[46px] text-red">:</Text>
				<Unit value={parts.seconds} label="SEK" />
			</View>
			<Text className="mt-2 text-center font-body text-[11px] text-ink-muted">{hint}</Text>
		</View>
	);
};
