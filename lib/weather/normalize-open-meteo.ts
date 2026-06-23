import type { OpenMeteoForecastResponse } from "@/lib/weather/open-meteo";
import type {
	DailyForecastItem,
	HourlyForecastItem,
	WeatherForecast,
	WeatherLocation,
} from "@/lib/weather/types";
import { getWeatherSymbol } from "@/lib/weather/weather-symbols";
import {
	formatDailyLabel,
	formatDateLabel,
	formatHourLabel,
	formatTimeLabel,
	getUvLabel,
} from "@/lib/weather/weather-utils";

function numberOrNull(value: number | null | undefined) {
	return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getHourlyForecast(
	forecast: OpenMeteoForecastResponse,
): HourlyForecastItem[] {
	const firstFutureIndex = forecast.hourly.time.findIndex(
		(time) => time >= forecast.current.time,
	);
	const startIndex = firstFutureIndex === -1 ? 0 : firstFutureIndex;

	return forecast.hourly.time
		.slice(startIndex, startIndex + 12)
		.map((time, index) => {
			const itemIndex = startIndex + index;
			const weatherCode = Math.round(
				forecast.hourly.weather_code[itemIndex] ?? 3,
			);

			return {
				timeLabel: formatHourLabel(time),
				temperature: forecast.hourly.temperature_2m[itemIndex] ?? 0,
				precipitation: forecast.hourly.precipitation[itemIndex] ?? 0,
				uvIndex: numberOrNull(forecast.hourly.uv_index[itemIndex]),
				weatherCode,
				isDay: forecast.hourly.is_day[itemIndex] === 1,
				windSpeed: numberOrNull(forecast.hourly.wind_speed_10m[itemIndex]),
			};
		});
}

function getDailyForecast(
	forecast: OpenMeteoForecastResponse,
): DailyForecastItem[] {
	return forecast.daily.time.slice(1, 7).map((date, index) => {
		const itemIndex = index + 1;

		return {
			label: formatDailyLabel(date, forecast.current.time),
			minTemperature: forecast.daily.temperature_2m_min[itemIndex] ?? 0,
			maxTemperature: forecast.daily.temperature_2m_max[itemIndex] ?? 0,
			precipitationTotal: forecast.daily.precipitation_sum[itemIndex] ?? 0,
			maxUvIndex: numberOrNull(forecast.daily.uv_index_max[itemIndex]),
			weatherCode: Math.round(forecast.daily.weather_code[itemIndex] ?? 3),
			maxWindSpeed: numberOrNull(forecast.daily.wind_speed_10m_max[itemIndex]),
		};
	});
}

export function normalizeOpenMeteoForecast(
	forecast: OpenMeteoForecastResponse,
	_location: WeatherLocation,
): WeatherForecast {
	const weatherCode = Math.round(forecast.current.weather_code);
	const isDay = forecast.current.is_day === 1;
	const uvIndex = numberOrNull(forecast.current.uv_index);

	return {
		current: {
			dateLabel: formatDateLabel(forecast.current.time),
			updatedLabel: formatTimeLabel(forecast.current.time),
			conditionLabel: getWeatherSymbol(weatherCode, isDay).label,
			temperature: forecast.current.temperature_2m,
			apparentTemperature: numberOrNull(forecast.current.apparent_temperature),
			precipitation: forecast.current.precipitation,
			humidity: numberOrNull(forecast.current.relative_humidity_2m),
			uvIndex,
			uvLabel: getUvLabel(uvIndex),
			weatherCode,
			isDay,
			windSpeed: numberOrNull(forecast.current.wind_speed_10m),
		},
		hourly: getHourlyForecast(forecast),
		daily: getDailyForecast(forecast),
	};
}
