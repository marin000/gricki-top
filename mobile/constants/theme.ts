import { palette } from "./palette";

export const theme = {
	background: palette.cream.canvas,
	surface: palette.cream.DEFAULT,
	surfaceDeep: palette.cream.deep,
	paper: palette.cream.paper,
	text: palette.ink.primary,
	textMuted: palette.ink.muted,
	textInverse: palette.ink.inverse,
	tint: palette.blue.DEFAULT,
	tintDark: palette.blue.dark,
	accent: palette.red.DEFAULT,
	line: palette.line,
	tabIconDefault: palette.ink.muted,
	tabIconSelected: palette.blue.DEFAULT,
} as const;
