import type { ReactNode } from "react";
import { Pressable, Text } from "react-native";

type ButtonProps = {
	label: string;
	onPress: () => void;
	variant?: "primary" | "secondary" | "ghost";
	disabled?: boolean;
	icon?: ReactNode;
};

export const Button = ({ label, onPress, variant = "primary", disabled = false, icon }: ButtonProps) => {
	const variantClass =
		variant === "primary"
			? "bg-blue"
			: variant === "secondary"
				? "bg-cream-deep border border-blue"
				: "bg-transparent border border-line";

	const textClass = variant === "primary" ? "text-ink-inverse" : "text-ink-primary";

	return (
		<Pressable
			accessibilityRole="button"
			disabled={disabled}
			onPress={onPress}
			className={`min-h-[48px] flex-row items-center justify-center rounded-xl px-3 py-3 ${variantClass} ${
				disabled ? "opacity-50" : "active:opacity-80"
			}`}
		>
			{icon}
			<Text
				numberOfLines={1}
				adjustsFontSizeToFit
				minimumFontScale={0.85}
				className={`font-body-semibold text-base ${textClass} ${icon ? "ml-2" : ""}`}
			>
				{label}
			</Text>
		</Pressable>
	);
};
