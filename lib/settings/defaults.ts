import type { AppearanceSettings, SearchSettings } from "@/lib/db/app-db";

export const FALLBACK_ACCENT_COLOR = "#b86d43";

export const defaultAppearanceSettings: AppearanceSettings = {
	id: "appearance",
	theme: "light",
	transparency: "high",
	blur: "medium",
	tint: true,
	accentMode: "auto",
	accentColor: FALLBACK_ACCENT_COLOR,
	updatedAt: new Date(0).toISOString(),
};

export const defaultSearchSettings: SearchSettings = {
	id: "search",
	lastEngine: "d",
	updatedAt: new Date(0).toISOString(),
};
