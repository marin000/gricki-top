import type { ReactNode } from "react";
import Svg, { Circle, G, Path } from "react-native-svg";

import { theme } from "@/constants";

export type StoryMotifKind =
	| "tower"
	| "funicular"
	| "fountain"
	| "gate"
	| "tunnel"
	| "park"
	| "market";

const drawings: Record<StoryMotifKind, ReactNode> = {
	tower: (
		<Path
			d="M45 78h70M54 78V35h52v43M49 35l12-19h38l12 19M70 16V7M92 16V7M72 45h16M72 57h16M69 78V66h20v12"
			stroke={theme.tint}
			strokeWidth={1.6}
			fill="none"
		/>
	),
	funicular: (
		<>
			<Path d="M22 76 128 28M29 84 135 36" stroke={theme.tint} strokeWidth={1.6} fill="none" />
			<Path
				d="m67 44 40-18 13 27-40 18Z M84 40l9 19M105 31l9 19"
				stroke={theme.tint}
				strokeWidth={1.6}
				fill="none"
			/>
		</>
	),
	fountain: (
		<>
			<Path
				d="M33 68h94l-10 17H43Z M51 61h58M58 49h44M80 48V20"
				stroke={theme.tint}
				strokeWidth={1.6}
				fill="none"
			/>
			<Path
				d="M80 20c-14 9-17 18-7 28M80 20c14 9 17 18 7 28"
				stroke={theme.tint}
				strokeWidth={1.6}
				fill="none"
			/>
		</>
	),
	gate: (
		<>
			<Path
				d="M37 83V25h76v58M48 83V37h54v46M59 83V53a16 16 0 0 1 32 0v30"
				stroke={theme.tint}
				strokeWidth={1.6}
				fill="none"
			/>
			<Path d="M49 25 60 12h30l12 13" stroke={theme.tint} strokeWidth={1.6} fill="none" />
		</>
	),
	tunnel: (
		<>
			<Path
				d="M24 82c0-42 24-65 56-65s56 23 56 65M45 82c0-29 14-45 35-45s35 16 35 45"
				stroke={theme.tint}
				strokeWidth={1.6}
				fill="none"
			/>
			<Path d="M80 37v45M53 56h54" stroke={theme.tint} strokeWidth={1.6} fill="none" />
		</>
	),
	park: (
		<>
			<Path d="M13 76h124M35 76V50M125 76V50M80 76V26" stroke={theme.tint} strokeWidth={1.6} fill="none" />
			<Circle cx="35" cy="38" r="17" stroke={theme.tint} strokeWidth={1.6} fill="none" />
			<Circle cx="125" cy="38" r="17" stroke={theme.tint} strokeWidth={1.6} fill="none" />
			<Circle cx="80" cy="19" r="18" stroke={theme.tint} strokeWidth={1.6} fill="none" />
		</>
	),
	market: (
		<>
			<Path
				d="M27 49h106v34H27Z M20 49c0-20 13-32 30-32s30 12 30 32M80 49c0-20 13-32 30-32s30 12 30 32"
				stroke={theme.tint}
				strokeWidth={1.6}
				fill="none"
			/>
			<Path d="M50 17v66M110 17v66" stroke={theme.tint} strokeWidth={1.6} fill="none" />
		</>
	),
};

export const motifFromCategory = (category?: string | null): StoryMotifKind => {
	const value = (category ?? "").toLowerCase();
	if (value.includes("uspinj")) return "funicular";
	if (value.includes("zden") || value.includes("voda") || value.includes("font")) return "fountain";
	if (value.includes("vrata") || value.includes("gate")) return "gate";
	if (value.includes("tunel")) return "tunnel";
	if (value.includes("park") || value.includes("potkova")) return "park";
	if (value.includes("trž") || value.includes("trz") || value.includes("dolac")) return "market";
	return "tower";
};

type StoryMotifProps = {
	motif?: StoryMotifKind;
	category?: string | null;
	showBackdrop?: boolean;
};

export const StoryMotif = ({ motif, category, showBackdrop = true }: StoryMotifProps) => {
	const kind = motif ?? motifFromCategory(category);

	return (
		<Svg width="100%" height="100%" viewBox="0 0 160 100">
			{showBackdrop ? <Circle cx="80" cy="50" r="46" fill="#EAD7AC" opacity={0.55} /> : null}
			<G>{drawings[kind]}</G>
		</Svg>
	);
};
