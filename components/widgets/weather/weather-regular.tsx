import { WeatherRegularTabs } from "@/components/widgets/weather/weather-regular-tabs";
import type {
	WeatherForecast,
	WeatherLocation,
	WeatherWidgetPreferences,
} from "@/lib/weather/types";

export function WeatherRegular({
	forecast,
	locationName,
	preferences,
	location,
}: {
	forecast: WeatherForecast;
	locationName: string;
	preferences: WeatherWidgetPreferences;
	location: WeatherLocation;
}) {
	return (
		<WeatherRegularTabs
			forecast={forecast}
			locationName={locationName}
			preferences={preferences}
			location={location}
		/>
	);
}
