import type {
  AccentMode,
  AppearanceSettings,
  BlurLevel,
  ThemeMode,
  TransparencyLevel,
} from "@/lib/db/app-db";
import { normalizeAccentColor } from "@/lib/settings/color";

export const APPEARANCE_COOKIE = "aria-appearance";
export const SEARCH_ENGINE_COOKIE = "aria-search-engine";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const themeModes: ThemeMode[] = ["light", "dark", "system"];
const transparencyLevels: TransparencyLevel[] = [
  "off",
  "low",
  "medium",
  "high",
];
const blurLevels: BlurLevel[] = ["off", "soft", "medium", "strong"];
const accentModes: AccentMode[] = ["auto", "manual"];

function isOneOf<T extends string>(
  value: unknown,
  options: readonly T[],
): value is T {
  return typeof value === "string" && options.includes(value as T);
}

export function parseAppearanceCookie(
  value: string | undefined,
): AppearanceSettings | null {
  if (!value) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(value));

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("theme" in parsed) ||
      !("transparency" in parsed) ||
      !("blur" in parsed) ||
      !("tint" in parsed) ||
      !("accentMode" in parsed) ||
      !("accentColor" in parsed) ||
      !isOneOf(parsed.theme, themeModes) ||
      !isOneOf(parsed.transparency, transparencyLevels) ||
      !isOneOf(parsed.blur, blurLevels) ||
      typeof parsed.tint !== "boolean" ||
      !isOneOf(parsed.accentMode, accentModes) ||
      typeof parsed.accentColor !== "string"
    ) {
      return null;
    }

    return {
      id: "appearance",
      theme: parsed.theme,
      transparency: parsed.transparency,
      blur: parsed.blur,
      tint: parsed.tint,
      accentMode: parsed.accentMode,
      accentColor: normalizeAccentColor(parsed.accentColor),
      updatedAt:
        "updatedAt" in parsed && typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : new Date(0).toISOString(),
    };
  } catch {
    return null;
  }
}

export function writeAppearanceCookie(settings: AppearanceSettings) {
  if (typeof document === "undefined") {
    return;
  }

  const value = encodeURIComponent(
    JSON.stringify({
      theme: settings.theme,
      transparency: settings.transparency,
      blur: settings.blur,
      tint: settings.tint,
      accentMode: settings.accentMode,
      accentColor: settings.accentColor,
      updatedAt: settings.updatedAt,
    }),
  );

  // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API is not available in Firefox yet.
  document.cookie = `${APPEARANCE_COOKIE}=${value}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function writeSearchEngineCookie(nickname: string) {
  if (typeof document === "undefined") {
    return;
  }

  // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API is not available in Firefox yet.
  document.cookie = `${SEARCH_ENGINE_COOKIE}=${encodeURIComponent(nickname)}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}
