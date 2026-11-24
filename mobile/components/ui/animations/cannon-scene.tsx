import { View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import Svg, { Circle, G, Path } from "react-native-svg";

import { theme } from "@/constants";

type CannonSceneProps = {
	recoil: SharedValue<number>;
	flash: SharedValue<number>;
	smokeOpacity: number;
	isFiring: boolean;
	eyebrow?: string;
};

export const CannonScene = ({ smokeOpacity, isFiring }: CannonSceneProps) => {
	const blastOpacity = isFiring ? Math.max(smokeOpacity, 0.85) : 0;

	return (
		<View className="w-full">
			<Svg width="100%" height={260} viewBox="0 0 380 320" preserveAspectRatio="xMidYMid meet">
				<G opacity={0.42} stroke={theme.accent} strokeWidth={1} fill="none">
					<Path d="M35 135H4M48 89 20 71M75 52 58 23M118 34 114 2M160 39l8-31M197 59l19-26M222 93l29-16" />
				</G>
				<Circle cx="116" cy="132" r="94" fill="#EAD7AC" opacity={0.7} />

				<G opacity={smokeOpacity}>
					<Circle cx="313" cy="98" r="18" fill={theme.paper} stroke={theme.tint} strokeWidth={1.5} />
					<Circle cx="337" cy="82" r="25" fill={theme.paper} stroke={theme.tint} strokeWidth={1.5} />
					<Circle cx="364" cy="97" r="16" fill={theme.paper} stroke={theme.tint} strokeWidth={1.5} />
					<Circle cx="338" cy="113" r="22" fill={theme.paper} stroke={theme.tint} strokeWidth={1.5} />
				</G>

				<G stroke={theme.tint} strokeWidth={1.5} fill="none">
					<Path d="M272 39q8-9 16 0M304 52q7-8 14 0" />
				</G>

				<G>
					<Path d="m71 89 45-55 45 55Z" fill={theme.tint} />
					<Path d="M112 34V16h8v18M108 16h16" fill={theme.tintDark} />
					<Path
						d="M59 103h114v155H59Z"
						fill="#E3D2AE"
						stroke={theme.tint}
						strokeWidth={1.5}
					/>
					<Path d="M51 88h130v24H51Z" fill={theme.tint} />
					<Path d="M45 106h142v11H45Z" fill={theme.tintDark} />
					<Path d="M72 117h88v141H72Z" fill={theme.tint} />
					<Path d="M100 132h32v40h-32Z" fill={theme.tintDark} />
					<Path d="M106 138h20v34h-20Z" fill="#8EA9AE" />
					<Path d="M98 195h36v63H98Z" fill={theme.tintDark} />
					<Path d="M106 204h20v54h-20Z" fill="#8EA9AE" />
					<Path
						d="M59 146h13M59 178h13M160 146h13M160 178h13M59 210h13M160 210h13"
						stroke={theme.accent}
						strokeWidth={1.5}
						fill="none"
					/>
					<Path d="M116 16V2m1 2h28l-7 8 7 8h-28" fill={theme.accent} stroke={theme.accent} />
				</G>

				<G>
					<Path d="M161 244h178l18 14H145Z" fill="#B7A980" />
					<Path d="m176 204 111-29 7 25-112 26Z" fill={theme.text} />
					<Path d="m283 172 20-5 9 31-20 5Z" fill={theme.text} />
					<Path d="m190 206 91-24" stroke="#9B9B8B" strokeWidth={2} fill="none" />
					<Path d="m184 223 69-3 25 28h-99Z" fill={theme.tint} />
					<Circle cx="201" cy="247" r="26" fill={theme.accent} stroke={theme.text} strokeWidth={2} />
					<Circle cx="201" cy="247" r="9" fill={theme.paper} />
					<Circle cx="260" cy="247" r="26" fill={theme.accent} stroke={theme.text} strokeWidth={2} />
					<Circle cx="260" cy="247" r="9" fill={theme.paper} />
					<Path
						d="m315 182 23-14-4 15 21-3-16 13 16 10-23-3 4 18-21-20Z"
						fill="#E8B945"
						stroke={theme.accent}
						strokeWidth={2}
						opacity={blastOpacity}
					/>
				</G>

				<Path
					d="M25 260c70-8 114 3 166 0 69-4 108-11 168 0"
					fill="none"
					stroke={theme.tint}
					strokeWidth={1.5}
				/>
				<G stroke={theme.accent} strokeWidth={1} opacity={0.42} fill="none">
					<Path d="M38 279h160M38 289h126M38 299h142" />
				</G>
			</Svg>
		</View>
	);
};
