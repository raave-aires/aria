import { describe, expect, it } from "vitest";

import {
	getPrecipitationLabel,
	getWeatherCondition,
} from "@/lib/weather/weather-utils";

describe("classificação da condição climática", () => {
	it("classifica a precipitação sem exagerar volumes residuais", () => {
		expect(getPrecipitationLabel(0.1)).toBe("Sem chuva relevante");
		expect(getPrecipitationLabel(0.2)).toBe("Possível garoa");
		expect(getPrecipitationLabel(1)).toBe("Chuva fraca");
		expect(getPrecipitationLabel(4)).toBe("Chuva moderada");
		expect(getPrecipitationLabel(10)).toBe("Chuva forte");
	});

	it("não exibe chuva nem ícone de chuva abaixo de 0,2 mm", () => {
		expect(
			getWeatherCondition({
				weatherCode: 61,
				precipitation: 0.1,
				cloudCover: 48,
			}),
		).toEqual({
			label: "Parcialmente nublado",
			visualWeatherCode: 2,
		});
	});

	it("usa precipitação relevante para qualificar códigos de chuva", () => {
		expect(
			getWeatherCondition({
				weatherCode: 61,
				precipitation: 2.5,
				cloudCover: 90,
			}),
		).toEqual({
			label: "Chuva fraca",
			visualWeatherCode: 61,
		});
	});
});
