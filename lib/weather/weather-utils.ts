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

export function formatSpeed(value: number) {
	return `${Math.round(value)} km/h`;
}

export function formatPrecipitation(value: number) {
	return `${numberFormat.format(value)} mm`;
}

export function formatUvIndex(value: number | null) {
	return value === null ? "—" : String(Math.round(value));
}
