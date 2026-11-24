import { Pressable, Text, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from "react-native-svg";

import { theme } from "@/constants";

export type FunicularTrack = {
	start: { x: number; y: number };
	end: { x: number; y: number };
};

type FunicularSceneProps = {
	progress: SharedValue<number>;
	track: FunicularTrack;
	score: number;
	skipLabel: string;
	bellLabel?: string;
	arrivalNote?: string;
	onSkip: () => void;
	moving?: boolean;
};

export const FunicularScene = ({
	progress,
	score,
	skipLabel,
	arrivalNote,
	onSkip,
	moving = true,
}: FunicularSceneProps) => {
	const cabinStyle = useAnimatedStyle(() => {
		const xPct = ((42 + 278 * progress.value) / 360) * 100;
		const yPct = ((198 - 150 * progress.value) / 260) * 100;
		return {
			left: `${xPct}%`,
			top: `${yPct}%`,
			transform: [{ translateX: -22 }, { translateY: -16 }, { rotate: "-28deg" }],
		};
	});

	const ties = Array.from({ length: 12 }, (_, index) => {
		const x = 44 + index * 24.8;
		const y = 222 - index * 13.4;
		return (
			<Path
				key={`tie-${x}-${y}`}
				d={`M${x} ${y}l13 11`}
				stroke={theme.tint}
				strokeWidth={1.4}
			/>
		);
	});

	return (
		<View className="mt-6 overflow-hidden rounded-3xl border border-line px-2 pb-4 pt-3">
			<View className="absolute inset-0">
				<Svg width="100%" height="100%" viewBox="0 0 360 340" preserveAspectRatio="none">
					<Defs>
						<LinearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
							<Stop offset="0" stopColor="#B8CBD2" />
							<Stop offset="0.4" stopColor="#E4EBEC" />
							<Stop offset="0.72" stopColor="#E9DFC6" />
							<Stop offset="1" stopColor="#C9BEA3" />
						</LinearGradient>
						<LinearGradient id="hillGrad" x1="0" y1="0" x2="1" y2="1">
							<Stop offset="0" stopColor="#9AAD8C" />
							<Stop offset="0.5" stopColor="#B7A980" />
							<Stop offset="1" stopColor="#8EA9AE" />
						</LinearGradient>
					</Defs>
					<Rect x="0" y="0" width="360" height="340" fill="url(#skyGrad)" />

					{/* soft clouds */}
					<G fill="#FAF6E9" opacity={0.5}>
						<Circle cx="48" cy="38" r="12" />
						<Circle cx="62" cy="36" r="16" />
						<Circle cx="80" cy="40" r="10" />
						<Circle cx="200" cy="26" r="9" />
						<Circle cx="214" cy="24" r="13" />
						<Circle cx="230" cy="28" r="8" />
						<Circle cx="310" cy="42" r="11" />
						<Circle cx="324" cy="40" r="14" />
					</G>

					{/* main hillside — Tomićeva slope */}
					<Path
						d="M0 250 C70 210 140 170 210 130 S300 70 360 55 L360 340 L0 340 Z"
						fill="url(#hillGrad)"
						opacity={0.48}
					/>
					<Path
						d="M0 270 C90 235 150 200 220 155 S300 95 360 80 L360 340 L0 340 Z"
						fill="#716F65"
						opacity={0.16}
					/>

					{/* buildings seated ON the slope (bases follow hill curve) */}
					<G opacity={0.55}>
						{/* mid-slope cream house */}
						<Path d="M88 168h34v42H88Z" fill="#E3D2AE" />
						<Path d="M88 168l17-14 17 14" fill="#C4B08A" />
						<Path d="M96 182h8v10h-8ZM106 182h8v10h-8Z" fill={theme.tintDark} opacity={0.35} />
						<Path d="M112 168v-8h4v8" fill="#9A8B6E" />
						{/* ochre house */}
						<Path d="M128 148h30v38h-30Z" fill="#D9C4A0" />
						<Path d="M128 148l15-12 15 12" fill="#BFA882" />
						<Path d="M134 160h8v9h-8ZM144 160h8v9h-8Z" fill={theme.tint} opacity={0.28} />
						<Path d="M136 172h14v3h-14Z" fill={theme.tint} opacity={0.3} />
						{/* terracotta roof cluster */}
						<Path d="M164 128h28v34h-28Z" fill="#E9DFC6" />
						<Path d="M164 128l14-11 14 11" fill="#C4785A" opacity={0.7} />
						<Path d="M170 140h7v8h-7ZM180 140h7v8h-7Z" fill={theme.tintDark} opacity={0.3} />
						{/* higher slope house toward Gornji */}
						<Path d="M198 108h26v30h-26Z" fill="#E3D2AE" />
						<Path d="M198 108l13-10 13 10" fill="#C4B08A" />
						<Path d="M204 118h7v7h-7ZM214 118h7v7h-7Z" fill={theme.tint} opacity={0.25} />
						{/* near Stross cluster */}
						<Path d="M230 88h24v28h-24Z" fill="#DCCFB0" />
						<Path d="M230 88l12-9 12 9" fill="#BFA882" />
						<Path d="M236 98h6v6h-6ZM244 98h6v6h-6Z" fill={theme.tintDark} opacity={0.28} />
					</G>

					{/* Stross greenery grounded on upper slope */}
					<G opacity={0.4}>
						<Circle cx="258" cy="96" r="15" fill="#7F9A72" />
						<Circle cx="274" cy="90" r="12" fill="#6F8A64" />
						<Circle cx="266" cy="102" r="10" fill="#8AAA7A" />
						<Path d="M258 108v16M274 100v14M266 110v10" stroke="#5A6B4E" strokeWidth={2} />
						<Circle cx="48" cy="228" r="13" fill="#7F9A72" />
						<Circle cx="60" cy="222" r="9" fill="#6F8A64" />
						<Path d="M48 238v14M60 230v12" stroke="#5A6B4E" strokeWidth={2} />
					</G>

					{/* cobble / street edge along slope */}
					<G stroke="#716F65" strokeWidth={1} opacity={0.22} fill="none">
						<Path d="M18 292h38M64 280h34M110 266h38M162 250h34M214 232h38M266 212h34" />
						<Path d="M28 302h26M80 288h28M132 274h32M184 256h28M238 238h32" />
					</G>
				</Svg>
			</View>

			<View className="mb-1 flex-row justify-between px-2">
				<Text className="font-body text-[10px] uppercase tracking-widest text-ink-muted">
					Donji grad
				</Text>
				<Text className="text-right font-body text-[10px] uppercase tracking-widest text-ink-muted">
					Gornji grad
				</Text>
			</View>

			<View className="h-56">
				<Svg width="100%" height="100%" viewBox="0 0 360 260">
					<Circle
						cx="286"
						cy="55"
						r="38"
						fill="#EAD7AC"
						opacity={0.55}
						stroke={theme.accent}
						strokeWidth={1.2}
					/>

					{/* lamp posts */}
					<G stroke={theme.tintDark} strokeWidth={1.3} fill="none" opacity={0.55}>
						<Path d="M58 180v40M58 180h10M66 176v8" />
						<Circle cx="68" cy="174" r="3.5" fill="#EAD7AC" opacity={0.7} />
						<Path d="M300 70v36M300 70h10M308 66v8" />
						<Circle cx="310" cy="64" r="3.5" fill="#EAD7AC" opacity={0.7} />
					</G>

					{/* Tomićeva canyon walls */}
					<G opacity={0.68}>
						<Path d="M0 36h52v224H0Z" fill="#E3D2AE" />
						<Path d="M0 36h52v10H0Z" fill="#D4C4A0" />
						<Path d="M0 36l26-18 26 18" fill="#C4B08A" opacity={0.8} />
						<Path
							d="M8 64h14v20H8ZM8 104h14v20H8ZM8 144h14v20H8ZM8 184h14v20H8Z"
							fill={theme.tintDark}
							opacity={0.32}
						/>
						<Path d="M28 64h14v20H28ZM28 104h14v20H28ZM28 144h14v20H28ZM28 184h14v20H28Z" fill={theme.tint} opacity={0.18} />
						<Path d="M26 48h8v8h-8Z" fill={theme.accent} opacity={0.4} />
						<Path d="M46 96h10v3H46ZM46 136h10v3H46ZM46 176h10v3H46Z" fill={theme.tint} opacity={0.35} />

						<Path d="M308 12h52v208h-52Z" fill="#E9DFC6" />
						<Path d="M308 12h52v10h-52Z" fill="#D9CFB4" />
						<Path d="M308 12l26-16 26 16" fill="#C4B08A" opacity={0.75} />
						<Path
							d="M320 42h16v18h-16ZM320 82h16v18h-16ZM320 122h16v18h-16ZM320 162h16v18h-16Z"
							fill={theme.tint}
							opacity={0.22}
						/>
						<Path d="M308 74h-8v3h8ZM308 114h-8v3h8ZM308 154h-8v3h8Z" fill={theme.tint} opacity={0.3} />
					</G>

					{/* Lotrščak tower near upper station */}
					<G opacity={0.55}>
						<Path d="M234 48h22v42h-22Z" fill="#DCCFB0" />
						<Path d="M230 48h30v7h-30Z" fill="#C4B08A" />
						<Path d="M240 28h10v20h-10Z" fill="#C4B08A" />
						<Path d="M245 18v12M245 18h12l-4 5 4 5h-12" fill={theme.accent} stroke={theme.accent} strokeWidth={1} />
						<Path d="M240 58h10v8h-10ZM240 72h10v8h-10Z" fill={theme.tintDark} opacity={0.35} />
					</G>

					{/* station houses */}
					<G stroke={theme.tint} strokeWidth={1.4} fill="none">
						<Path d="M266 72h74v30h-74Z M274 72V46h22v26M303 72V37h29v35M308 37l9-13 10 13M279 53h12M310 47h15M310 57h15" />
						<Path d="M15 207h86v28H15Z M25 207v-31h25v31M58 207v-45h33v45M65 174h18M31 186h13" />
					</G>

					{/* track bed */}
					<Path
						d="M7 230C92 213 143 174 199 130S288 64 350 45"
						fill="none"
						stroke="#8EA9AE"
						strokeWidth={10}
						opacity={0.45}
					/>
					<G stroke={theme.tint} strokeWidth={2} fill="none">
						<Path d="M39 216 318 66M49 229 328 79" />
						{ties}
					</G>
					<G stroke={theme.tint} strokeWidth={1.5} fill="none">
						<Path d="M23 213h44v17H23ZM18 213l27-16 27 16" />
						<Path d="M300 61h44v17h-44ZM295 61l27-16 27 16" />
					</G>

				</Svg>

				<Animated.View className="absolute h-9 w-12" style={cabinStyle}>
					<View className="h-7 w-11 rounded-sm bg-blue">
						<View className="-mt-1.5 h-2 w-12 self-center rounded-t-sm bg-red" />
						<View className="mt-1 flex-row justify-center gap-1">
							<View className="h-2.5 w-3 bg-cream" />
							<View className="h-2.5 w-3 bg-cream" />
						</View>
					</View>
				</Animated.View>
			</View>

			<View className="mt-1 flex-row items-center justify-between px-3">
				{[0, 1, 2, 3, 4, 5].map((step) => (
					<View
						key={`mark-${step}`}
						className={`h-7 w-7 items-center justify-center rounded-full border ${
							step <= score ? "border-red bg-red" : "border-line bg-cream/70"
						}`}
					>
						<Text
							className={`font-body-semibold text-xs ${
								step <= score ? "text-ink-inverse" : "text-ink-muted"
							}`}
						>
							{step}
						</Text>
					</View>
				))}
			</View>

			{moving ? (
				<Pressable accessibilityRole="button" onPress={onSkip} className="mt-3 self-center">
					<Text className="font-body text-xs text-blue">{skipLabel}</Text>
				</Pressable>
			) : (
				<Text className="mt-3 text-center font-body text-sm text-ink-muted">{arrivalNote}</Text>
			)}
		</View>
	);
};
