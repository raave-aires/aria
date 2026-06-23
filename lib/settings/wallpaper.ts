import { getDb } from "@/lib/db/app-db";

export async function getCurrentWallpaper() {
	return getDb().wallpapers.get("current");
}

export async function saveUserWallpaper(file: File) {
	const wallpaper = {
		id: "current" as const,
		blob: file,
		name: file.name,
		mimeType: file.type,
		size: file.size,
		updatedAt: new Date().toISOString(),
	};

	await getDb().wallpapers.put(wallpaper);
	return wallpaper;
}

export async function updateWallpaperAccent(
	accentColor: string,
	palette: string[],
) {
	await getDb().wallpapers.update("current", {
		accentColor,
		palette,
		updatedAt: new Date().toISOString(),
	});
}

export async function removeUserWallpaper() {
	await getDb().wallpapers.delete("current");
}
