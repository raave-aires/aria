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

export function isValidHexColor(color: string) {
  return /^#[\da-f]{6}$/i.test(color);
}

export function normalizeAccentColor(color: string | undefined) {
  return color && isValidHexColor(color) ? color : FALLBACK_ACCENT_COLOR;
}
