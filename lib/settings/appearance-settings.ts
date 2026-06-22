import type { AppearanceSettings } from "@/lib/db/app-db";
import { getDb } from "@/lib/db/app-db";
import {
  getAccentForegroundRgb,
  hexToRgbTriplet,
  normalizeAccentColor,
} from "@/lib/settings/color";
import { defaultAppearanceSettings } from "@/lib/settings/defaults";
import { writeAppearanceCookie } from "@/lib/settings/persistence-cookie";

export async function getAppearanceSettings() {
  return (
    (await getDb().appearance.get("appearance")) ?? defaultAppearanceSettings
  );
}

export async function saveAppearanceSettings(settings: AppearanceSettings) {
  const nextSettings = {
    ...settings,
    accentColor: normalizeAccentColor(settings.accentColor),
    updatedAt: new Date().toISOString(),
  };

  await getDb().appearance.put(nextSettings);
  writeAppearanceCookie(nextSettings);
  return nextSettings;
}

export async function updateAppearanceSettings(
  patch: Partial<Omit<AppearanceSettings, "id" | "updatedAt">>,
) {
  const current = await getAppearanceSettings();
  return saveAppearanceSettings({ ...current, ...patch });
}

export function applyAppearanceSettings(settings: AppearanceSettings) {
  const root = document.documentElement;

  // Material settings live on <html> so every shadcn surface inherits them without prop drilling.
  root.dataset.theme = settings.theme;
  root.dataset.transparency = settings.transparency;
  root.dataset.blur = settings.blur;
  root.dataset.tint = settings.tint ? "on" : "off";
  root.style.setProperty(
    "--app-accent-rgb",
    hexToRgbTriplet(normalizeAccentColor(settings.accentColor)),
  );
  root.style.setProperty(
    "--app-accent-foreground-rgb",
    getAccentForegroundRgb(normalizeAccentColor(settings.accentColor)),
  );
}
