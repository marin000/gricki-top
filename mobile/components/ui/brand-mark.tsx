import { Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { theme } from "@/constants";

type BrandMarkProps = {
	compact?: boolean;
};

export const BrandMark = ({ compact = false }: BrandMarkProps) => {
	const size = compact ? 34 : 40;

	return (
		<View className="flex-row items-center" accessibilityRole="header">
			<Svg width={size} height={size} viewBox="0 0 44 44" fill="none">
				<Circle
					cx="22"
					cy="22"
					r="20.5"
					stroke={theme.tint}
					strokeWidth="1.4"
					fill="none"
				/>
				<Path
					d="M10 31h25M14 31V18h14v13M12.5 18l3-5h11l3 5M17 13V9M25 13V9M18 22h6M18 26h6"
					stroke={theme.tint}
					strokeWidth="1.4"
					strokeLinecap="round"
					strokeLinejoin="round"
					fill="none"
				/>
				<Path
					d="M29 23h8M32 20l5 3-5 3"
					stroke={theme.tint}
					strokeWidth="1.4"
					strokeLinecap="round"
					strokeLinejoin="round"
					fill="none"
				/>
			</Svg>
			<View className="ml-2">
				<Text className="font-display-bold text-[19px] leading-[15px] text-blue">Grički</Text>
				<Text className="ml-3 font-display-italic text-[19px] leading-[15px] text-red">top</Text>
			</View>
		</View>
	);
};
