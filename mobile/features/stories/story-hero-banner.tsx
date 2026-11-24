import { View } from "react-native";
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from "react-native-svg";

import { theme } from "@/constants";

export const StoryHeroBanner = () => {
	return (
		<View className="mt-4 h-44 overflow-hidden">
			<Svg width="100%" height="100%" viewBox="0 0 360 176" preserveAspectRatio="xMidYMid slice">
				<Defs>
					<LinearGradient id="storySky" x1="0" y1="0" x2="0" y2="1">
						<Stop offset="0" stopColor="#B8CBD2" />
						<Stop offset="0.45" stopColor="#E4EBEC" />
						<Stop offset="1" stopColor="#EAD7AC" />
					</LinearGradient>
					<LinearGradient id="storyGround" x1="0" y1="0" x2="1" y2="0">
						<Stop offset="0" stopColor="#C9BEA3" />
						<Stop offset="0.5" stopColor="#D9CFB4" />
						<Stop offset="1" stopColor="#C4B08A" />
					</LinearGradient>
				</Defs>

				<Rect x="0" y="0" width="360" height="176" fill="url(#storySky)" />

				{/* clouds */}
				<G fill="#FAF6E9" opacity={0.55}>
					<Circle cx="36" cy="28" r="10" />
					<Circle cx="50" cy="26" r="14" />
					<Circle cx="66" cy="30" r="9" />
					<Circle cx="280" cy="22" r="11" />
					<Circle cx="296" cy="20" r="15" />
					<Circle cx="314" cy="26" r="9" />
				</G>

				{/* distant ridge */}
				<Path
					d="M0 118 C60 98 120 108 180 100 S280 88 360 96 L360 176 L0 176 Z"
					fill="url(#storyGround)"
					opacity={0.55}
				/>
				<Path
					d="M0 132 C80 118 140 126 200 118 S300 110 360 120 L360 176 L0 176 Z"
					fill="#716F65"
					opacity={0.12}
				/>

				{/* left cluster: Lower Town roofs + fountain hint */}
				<G opacity={0.7}>
					<Path d="M8 108h38v40H8Z" fill="#E3D2AE" />
					<Path d="M8 108l19-14 19 14" fill="#C4785A" opacity={0.75} />
					<Path d="M14 120h8v10H14ZM26 120h8v10H26Z" fill={theme.tintDark} opacity={0.3} />
					<Path d="M42 100h32v48H42Z" fill="#DCCFB0" />
					<Path d="M42 100l16-12 16 12" fill="#C4B08A" />
					<Path d="M48 112h8v9H48ZM60 112h8v9H60Z" fill={theme.tint} opacity={0.25} />
					{/* Manduševac / fountain hint */}
					<Path
						d="M78 138h36l-6 10H84Z M88 132h16M92 124h8M96 124V112"
						stroke={theme.tint}
						strokeWidth={1.4}
						fill="none"
						opacity={0.55}
					/>
				</G>

				{/* left-mid: gate / Kamenita vrata hint */}
				<G opacity={0.55} stroke={theme.tint} strokeWidth={1.3} fill="none">
					<Path d="M112 148V108h40v40M120 148V116h24v32M128 148V126a8 8 0 0 1 16 0v22" />
					<Path d="M120 108l8-10h16l8 10" />
				</G>

				{/* right-mid: funicular track silhouette */}
				<G opacity={0.45} stroke={theme.tint} strokeWidth={1.5} fill="none">
					<Path d="M210 140 268 88M216 146 274 94" />
					<Path d="m232 118 22-12 8 14-22 12Z" />
				</G>

				{/* right: Lotrščak + Upper Town roofs */}
				<G opacity={0.75}>
					<Path d="M278 78h28v58h-28Z" fill="#DCCFB0" />
					<Path d="M274 78h36v8h-36Z" fill="#C4B08A" />
					<Path d="M288 52h8v26h-8Z" fill="#C4B08A" />
					<Path d="M292 40v14M292 40h14l-4 5 4 5h-14" fill={theme.accent} />
					<Path d="M284 96h12v10h-12ZM284 114h12v10h-12Z" fill={theme.tintDark} opacity={0.32} />
					<Path d="M310 96h42v52h-42Z" fill="#E9DFC6" />
					<Path d="M310 96l21-14 21 14" fill="#C4785A" opacity={0.7} />
					<Path d="M318 110h10v12h-10ZM334 110h10v12h-10Z" fill={theme.tint} opacity={0.25} />
					<Path d="M318 128h26v3h-26Z" fill={theme.tint} opacity={0.3} />
				</G>

				{/* park trees on ridge */}
				<G opacity={0.4}>
					<Circle cx="198" cy="108" r="12" fill="#7F9A72" />
					<Circle cx="210" cy="104" r="9" fill="#6F8A64" />
					<Path d="M198 118v14M210 112v12" stroke="#5A6B4E" strokeWidth={2} />
					<Circle cx="248" cy="100" r="10" fill="#7F9A72" />
					<Path d="M248 108v12" stroke="#5A6B4E" strokeWidth={2} />
				</G>
			</Svg>
		</View>
	);
};
