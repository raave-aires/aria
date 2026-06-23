import type { Color } from "colorthief";

import { FALLBACK_ACCENT_COLOR } from "@/lib/settings/defaults";

function pickUsefulAccentColor(palette: Color[]) {
	return palette.find((color) => {
		const { s, l } = color.hsl();
		return s >= 38 && l >= 22 && l <= 68;
	});
}

export async function extractAccentColorFromImageElement(
	image: HTMLImageElement,
) {
	try {
		const { getPalette } = await import("colorthief");
		const colors =
			(await getPalette(image, {
				colorCount: 8,
				ignoreWhite: true,
				minSaturation: 0.2,
			})) ?? [];
		const palette = colors.map((color) => color.hex());
		const accentColor =
			pickUsefulAccentColor(colors)?.hex() ?? FALLBACK_ACCENT_COLOR;

		return { accentColor, palette };
	} catch {
		return {
			accentColor: FALLBACK_ACCENT_COLOR,
			palette: [FALLBACK_ACCENT_COLOR],
		};
	}
}
