import { FALLBACK_ACCENT_COLOR } from "@/lib/settings/defaults";

export function hexToRgbTriplet(hex: string) {
  const clean = hex.replace("#", "");

  if (!/^[\da-f]{6}$/i.test(clean)) {
    return "184 109 67";
  }

  const red = Number.parseInt(clean.slice(0, 2), 16);
  const green = Number.parseInt(clean.slice(2, 4), 16);
  const blue = Number.parseInt(clean.slice(4, 6), 16);

  return `${red} ${green} ${blue}`;
}

export function getAccentForegroundRgb(hex: string) {
  const clean = hex.replace("#", "");

  if (!/^[\da-f]{6}$/i.test(clean)) {
    return "255 255 255";
  }

  const channels = [
    Number.parseInt(clean.slice(0, 2), 16),
    Number.parseInt(clean.slice(2, 4), 16),
    Number.parseInt(clean.slice(4, 6), 16),
  ].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  const luminance =
    0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];

  return luminance > 0.42 ? "12 24 28" : "255 255 255";
}

export function isValidHexColor(color: string) {
  return /^#[\da-f]{6}$/i.test(color);
}

export function normalizeAccentColor(color: string | undefined) {
  return color && isValidHexColor(color) ? color : FALLBACK_ACCENT_COLOR;
}
