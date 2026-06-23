import { z } from "zod";

import type { WeatherLocationSearchResult } from "@/lib/weather/types";

const OPEN_METEO_GEOCODING_URL =
	"https://geocoding-api.open-meteo.com/v1/search";
const GEOCODING_REVALIDATE_SECONDS = 60 * 60 * 24 * 30;

const geocodingResponseSchema = z.object({
	results: z
		.array(
			z.object({
				name: z.string(),
				latitude: z.number(),
				longitude: z.number(),
				timezone: z.string(),
				country: z.string().optional(),
				country_code: z.string().optional(),
				admin1: z.string().optional(),
			}),
		)
		.optional(),
});

function getLocationLabel(result: {
	name: string;
	admin1?: string;
	country?: string;
}) {
	return [result.name, result.admin1, result.country]
		.filter(
			(part, index, parts) => Boolean(part) && parts.indexOf(part) === index,
		)
		.join(", ");
}

export async function searchOpenMeteoLocations(query: string) {
	const params = new URLSearchParams({
		name: query,
		count: "5",
		language: "pt",
		format: "json",
	});
	const response = await fetch(`${OPEN_METEO_GEOCODING_URL}?${params}`, {
		next: { revalidate: GEOCODING_REVALIDATE_SECONDS },
		signal: AbortSignal.timeout(5_000),
	});

	if (!response.ok) {
		throw new Error(`Open-Meteo respondeu ${response.status}.`);
	}

	const payload = geocodingResponseSchema.safeParse(await response.json());

	if (!payload.success) {
		throw new Error(
			"A resposta de geocodificação não possui o formato esperado.",
		);
	}

	return (payload.data.results ?? []).map<WeatherLocationSearchResult>(
		(result) => ({
			name: result.name,
			label: getLocationLabel(result),
			latitude: result.latitude,
			longitude: result.longitude,
			timezone: result.timezone,
			country: result.country ?? "",
			countryCode: result.country_code ?? null,
			state: result.admin1 ?? null,
		}),
	);
}
