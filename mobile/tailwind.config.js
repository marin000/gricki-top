const { palette } = require("./constants/palette");

/** @type {import("tailwindcss").Config} */
module.exports = {
	content: ["./app/**/*.{js,jsx,ts,tsx}", "./features/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			colors: {
				cream: palette.cream,
				ink: palette.ink,
				blue: palette.blue,
				red: palette.red,
				metal: palette.metal,
				line: palette.line,
			},
			fontFamily: {
				display: ["CormorantGaramond_600SemiBold"],
				"display-bold": ["CormorantGaramond_700Bold"],
				"display-italic": ["CormorantGaramond_600SemiBold_Italic"],
				body: ["DMSans_400Regular"],
				"body-medium": ["DMSans_500Medium"],
				"body-semibold": ["DMSans_600SemiBold"],
			},
		},
	},
	plugins: [],
};
