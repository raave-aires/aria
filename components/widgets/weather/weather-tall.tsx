import {
  WeatherCurrentSummary,
  WeatherMetrics,
} from "@/components/widgets/weather/weather-current";
import { WeatherTabs } from "@/components/widgets/weather/weather-tabs";
import type {
  WeatherForecast,
  WeatherWidgetPreferences,
} from "@/lib/weather/types";

export function WeatherTall({
  forecast,
  preferences,
  locationName,
}: {
  forecast: WeatherForecast;
  preferences: WeatherWidgetPreferences;
  locationName: string;
}) {
  return (
    <div className="grid min-w-0 gap-5">
      <WeatherCurrentSummary
        current={forecast.current}
        locationName={locationName}
      />
      <WeatherMetrics current={forecast.current} />
      <WeatherTabs
        hourly={forecast.hourly}
        daily={forecast.daily}
        preferences={preferences}
      />
    </div>
  );
}
