import { describe, expect, it } from "vitest";
import { normalizeOpenMeteoForecast } from "@/lib/weather/normalize-open-meteo";
import { defaultWeatherLocation } from "@/lib/weather/weather-settings";
import { openMeteoForecastFixture } from "@/tests/fixtures/open-meteo-forecast";

describe("normalizeOpenMeteoForecast", () => {
	it("normaliza os dados atuais e mantém a data no fuso da localização", () => {
		const forecast = normalizeOpenMeteoForecast(
			openMeteoForecastFixture,
			defaultWeatherLocation,
		);

		expect(forecast.current).toMatchObject({
			conditionLabel: "Parcialmente nublado",
			temperature: 27.2,
			apparentTemperature: 32.1,
			precipitation: 0,
			uvLabel: "Moderado",
			updatedLabel: "09:30",
		});
		expect(forecast.current.dateLabel).toContain("23 de junho");
	});

	it("seleciona as próximas doze horas sem incluir o horário anterior", () => {
		const forecast = normalizeOpenMeteoForecast(
			openMeteoForecastFixture,
			defaultWeatherLocation,
		);

		expect(forecast.hourly).toHaveLength(12);
		expect(forecast.hourly[0]).toMatchObject({ timeLabel: "10h", uvIndex: 3 });
		expect(forecast.hourly.at(-1)).toMatchObject({
			timeLabel: "21h",
			isDay: false,
		});
	});

	it("agrega os próximos seis dias e inicia o rótulo por Amanhã", () => {
		const forecast = normalizeOpenMeteoForecast(
			openMeteoForecastFixture,
			defaultWeatherLocation,
		);

		expect(forecast.daily).toHaveLength(6);
		expect(forecast.daily[0]).toMatchObject({
			label: "Amanhã",
			minTemperature: 22,
			maxTemperature: 31,
			precipitationTotal: 1.1,
			maxUvIndex: 8.1,
		});
	});
});
