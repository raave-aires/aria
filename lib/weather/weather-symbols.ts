type WeatherSymbol = {
	asset: string;
	label: string;
};

function daytimeAsset(day: string, night: string, isDay: boolean) {
	return isDay ? day : night;
}

export function getWeatherSymbol(
	weatherCode: number,
	isDay: boolean,
): WeatherSymbol {
	switch (weatherCode) {
		case 0:
			return { asset: daytimeAsset("01d", "01n", isDay), label: "Céu limpo" };
		case 1:
			return {
				asset: daytimeAsset("02d", "02n", isDay),
				label: "Predominantemente limpo",
			};
		case 2:
			return {
				asset: daytimeAsset("03d", "03n", isDay),
				label: "Parcialmente nublado",
			};
		case 3:
			return { asset: "04", label: "Encoberto" };
		case 45:
		case 48:
			return { asset: "50", label: "Neblina" };
		case 51:
		case 53:
		case 61:
			return { asset: daytimeAsset("40d", "40n", isDay), label: "Chuva fraca" };
		case 55:
		case 63:
		case 65:
			return { asset: daytimeAsset("41d", "41n", isDay), label: "Chuva" };
		case 56:
		case 66:
			return {
				asset: daytimeAsset("43d", "43n", isDay),
				label: "Chuva congelante",
			};
		case 57:
		case 67:
			return {
				asset: daytimeAsset("44d", "44n", isDay),
				label: "Chuva congelante forte",
			};
		case 71:
		case 73:
		case 77:
			return { asset: "46", label: "Neve" };
		case 75:
			return { asset: daytimeAsset("47", "47", isDay), label: "Neve forte" };
		case 80:
		case 81:
			return {
				asset: daytimeAsset("05d", "05n", isDay),
				label: "Pancadas de chuva",
			};
		case 82:
			return {
				asset: daytimeAsset("34", "34", isDay),
				label: "Pancadas fortes de chuva",
			};
		case 85:
		case 86:
			return {
				asset: daytimeAsset("08d", "08n", isDay),
				label: "Pancadas de neve",
			};
		case 95:
			return { asset: daytimeAsset("06d", "06n", isDay), label: "Trovoadas" };
		case 96:
		case 99:
			return { asset: "11", label: "Trovoadas com granizo" };
		default:
			return { asset: "04", label: "Condições variáveis" };
	}
}
