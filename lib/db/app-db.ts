import Dexie, { type Table } from "dexie";

export type ThemeMode = "light" | "dark" | "system";
export type TransparencyLevel = "off" | "low" | "medium" | "high";
export type BlurLevel = "off" | "soft" | "medium" | "strong";
export type AccentMode = "auto" | "manual";
export type SearchEngineNickname = string;

export type AppearanceSettings = {
	id: "appearance";
	theme: ThemeMode;
	transparency: TransparencyLevel;
	blur: BlurLevel;
	tint: boolean;
	accentMode: AccentMode;
	accentColor: string;
	updatedAt: string;
};

export type WallpaperRecord = {
	id: "current";
	blob: Blob;
	name?: string;
	mimeType?: string;
	size?: number;
	accentColor?: string;
	palette?: string[];
	updatedAt: string;
};

export type SearchSettings = {
	id: "search";
	lastEngine: SearchEngineNickname;
	updatedAt: string;
};

class AriaDatabase extends Dexie {
	appearance!: Table<AppearanceSettings, string>;
	wallpapers!: Table<WallpaperRecord, string>;
	search!: Table<SearchSettings, string>;

	constructor() {
		super("aria");

		this.version(1).stores({
			appearance: "id, updatedAt",
			wallpapers: "id, updatedAt",
			search: "id, updatedAt",
		});
	}
}

let database: AriaDatabase | undefined;

// Dexie is intentionally initialized only from client components, where IndexedDB exists.
export function getDb() {
	database ??= new AriaDatabase();
	return database;
}
