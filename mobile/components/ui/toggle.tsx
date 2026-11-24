import { Pressable, View } from "react-native";

type ToggleProps = {
	checked: boolean;
	onChange: (next: boolean) => void;
	label: string;
	disabled?: boolean;
};

export const Toggle = ({ checked, onChange, label, disabled = false }: ToggleProps) => {
	return (
		<Pressable
			accessibilityRole="switch"
			accessibilityLabel={label}
			accessibilityState={{ checked, disabled }}
			disabled={disabled}
			onPress={() => onChange(!checked)}
			className={`h-8 w-14 justify-center rounded-full px-1 ${checked ? "bg-blue" : "bg-cream-deep"} ${
				disabled ? "opacity-50" : ""
			}`}
		>
			<View className={`h-6 w-6 rounded-full bg-cream-paper ${checked ? "self-end" : "self-start"}`} />
		</Pressable>
	);
};
