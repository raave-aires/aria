const utcDateFormat = new Intl.DateTimeFormat("pt-BR", {
	weekday: "long",
	day: "numeric",
	month: "long",
	timeZone: "UTC",
});

const weekdayFormat = new Intl.DateTimeFormat("pt-BR", {
	weekday: "long",
	timeZone: "UTC",
});

const numberFormat = new Intl.NumberFormat("pt-BR", {
	maximumFractionDigits: 1,
	minimumFractionDigits: 0,
});

const rainWeatherCodes = new Set([
	51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82,
]);

type WeatherConditionInput = {
	weatherCode: number;
	precipitation: number;
	cloudCover: number | null;
};

function getSkyWeatherCode(cloudCover: number | null) {
	if (cloudCover === null) {
		return 2;
	}

	if (cloudCover <= 20) return 0;
	if (cloudCover <= 65) return 2;

	return 3;
}

function getWeatherCodeLabel(weatherCode: number) {
	switch (weatherCode) {
		case 0:
			return "Céu limpo";
		case 1:
		case 2:
			return "Parcialmente nublado";
		case 3:
			return "Nublado";
		case 45:
		case 48:
			return "Neblina";
		case 71:
		case 73:
		case 77:
			return "Neve";
		case 75:
			return "Neve forte";
		case 85:
		case 86:
			return "Pancadas de neve";
		case 95:
			return "Trovoadas";
		case 96:
		case 99:
			return "Trovoadas com granizo";
		default:
			return "Condições variáveis";
	}
}

function getConditionPrecipitationLabel(value: number) {
	switch (getPrecipitationLabel(value)) {
		case "Possível garoa":
			return "Garoa";
		case "Chuva fraca":
		case "Chuva moderada":
		case "Chuva forte":
			return getPrecipitationLabel(value);
		default:
			return null;
	}
}

function getDatePart(value: string) {
	return value.split("T")[0] ?? value;
}

function localDateToUtc(value: string) {
	const [year, month, day] = getDatePart(value).split("-").map(Number);
	return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
}

function capitalize(value: string) {
	return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}

export function formatDateLabel(value: string) {
	return capitalize(utcDateFormat.format(localDateToUtc(value)));
}

export function formatTimeLabel(value: string) {
	return value.split("T")[1]?.slice(0, 5) ?? "—";
}

export function formatHourLabel(value: string) {
	const hour = value.split("T")[1]?.slice(0, 2);
	return hour ? `${hour}h` : "—";
}

export function formatDailyLabel(value: string, currentValue: string) {
	const currentDate = localDateToUtc(currentValue);
	currentDate.setUTCDate(currentDate.getUTCDate() + 1);

	if (getDatePart(value) === currentDate.toISOString().slice(0, 10)) {
		return "Amanhã";
	}

	return capitalize(weekdayFormat.format(localDateToUtc(value)));
}

export function getUvLabel(uvIndex: number | null) {
	if (uvIndex === null) {
		return null;
	}

	if (uvIndex <= 2) return "Baixo";
	if (uvIndex <= 5) return "Moderado";
	if (uvIndex <= 7) return "Alto";
	if (uvIndex <= 10) return "Muito alto";

	return "Extremo";
}

export function formatTemperature(value: number) {
	return `${Math.round(value)}°`;
}

export function formatHumidity(value: number) {
	return `${Math.round(value)}%`;
}

export function formatSpeed(value: number) {
	return `${Math.round(value)} km/h`;
}

export function formatPrecipitation(value: number) {
	return `${numberFormat.format(value)} mm`;
}

export function getPrecipitationLabel(value: number) {
	if (value < 0.2) return "Sem chuva relevante";
	if (value < 1) return "Possível garoa";
	if (value < 4) return "Chuva fraca";
	if (value < 10) return "Chuva moderada";

	return "Chuva forte";
}

export function getWeatherCondition({
	weatherCode,
	precipitation,
	cloudCover,
}: WeatherConditionInput) {
	const isRainCode = rainWeatherCodes.has(weatherCode);
	const visualWeatherCode =
		isRainCode && precipitation < 0.2
			? getSkyWeatherCode(cloudCover)
			: weatherCode;
	const precipitationCondition = getConditionPrecipitationLabel(precipitation);

	if (isRainCode && precipitationCondition) {
		return {
			label: precipitationCondition,
			visualWeatherCode,
		};
	}

	return {
		label: getWeatherCodeLabel(visualWeatherCode),
		visualWeatherCode,
	};
}

export function formatUvIndex(value: number | null) {
	return value === null ? "—" : String(Math.round(value));
}
