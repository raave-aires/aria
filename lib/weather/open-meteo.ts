import { z } from "zod";

import { normalizeOpenMeteoForecast } from "@/lib/weather/normalize-open-meteo";
import type { WeatherLocation } from "@/lib/weather/types";

const OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const FORECAST_REVALIDATE_SECONDS = 60 * 60;

const numberArraySchema = z.array(z.number().nullable());

const openMeteoForecastSchema = z.object({
	timezone: z.string(),
	current: z.object({
		time: z.string(),
		temperature_2m: z.number(),
		apparent_temperature: z.number().nullable(),
		precipitation: z.number(),
		relative_humidity_2m: z.number().nullable(),
		uv_index: z.number().nullable(),
		weather_code: z.number(),
		is_day: z.number(),
		wind_speed_10m: z.number().nullable(),
	}),
	hourly: z.object({
		time: z.array(z.string()),
		temperature_2m: numberArraySchema,
		precipitation: numberArraySchema,
		uv_index: numberArraySchema,
		weather_code: numberArraySchema,
		is_day: numberArraySchema,
		wind_speed_10m: numberArraySchema,
	}),
	daily: z.object({
		time: z.array(z.string()),
		weather_code: numberArraySchema,
		temperature_2m_min: numberArraySchema,
		temperature_2m_max: numberArraySchema,
		precipitation_sum: numberArraySchema,
		uv_index_max: numberArraySchema,
		wind_speed_10m_max: numberArraySchema,
	}),
});

export type OpenMeteoForecastResponse = z.infer<typeof openMeteoForecastSchema>;

export async function getOpenMeteoForecast(location: WeatherLocation) {
	const latitude = location.latitude.toFixed(4);
	const longitude = location.longitude.toFixed(4);
	const params = new URLSearchParams({
		latitude,
		longitude,
		timezone: location.timezone,
		forecast_days: "7",
		temperature_unit: "celsius",
		precipitation_unit: "mm",
		wind_speed_unit: "kmh",
		current:
			"temperature_2m,apparent_temperature,precipitation,relative_humidity_2m,uv_index,weather_code,is_day,wind_speed_10m",
		hourly:
			"temperature_2m,precipitation,uv_index,weather_code,is_day,wind_speed_10m",
		daily:
			"weather_code,temperature_2m_min,temperature_2m_max,precipitation_sum,uv_index_max,wind_speed_10m_max",
	});
	const response = await fetch(`${OPEN_METEO_FORECAST_URL}?${params}`, {
		next: {
			revalidate: FORECAST_REVALIDATE_SECONDS,
			tags: [`weather:${latitude}:${longitude}`],
		},
		signal: AbortSignal.timeout(5_000),
	});

	if (!response.ok) {
		throw new Error(`Open-Meteo respondeu ${response.status}.`);
	}

	const payload = openMeteoForecastSchema.safeParse(await response.json());

	if (!payload.success) {
		throw new Error("A resposta do Open-Meteo não possui o formato esperado.");
	}

	return normalizeOpenMeteoForecast(payload.data, location);
}
