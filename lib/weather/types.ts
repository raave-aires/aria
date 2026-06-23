export type WeatherWidgetSize = "regular" | "tall";
export type WeatherForecastMode = "hours" | "days";

export type WeatherLocation = {
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

export type WeatherLocationSearchResult = WeatherLocation & {
  label: string;
  country: string;
  countryCode: string | null;
  state: string | null;
};

export type WeatherWidgetPreferences = {
  size: WeatherWidgetSize;
  forecastMode: WeatherForecastMode;
};

export type WeatherSettings = {
  location: WeatherLocation;
  preferences: WeatherWidgetPreferences;
};

export type CurrentWeather = {
  dateLabel: string;
  updatedLabel: string;
  conditionLabel: string;
  temperature: number;
  apparentTemperature: number | null;
  precipitation: number;
  humidity: number | null;
  uvIndex: number | null;
  uvLabel: string | null;
  weatherCode: number;
  isDay: boolean;
  windSpeed: number | null;
};

export type HourlyForecastItem = {
  timeLabel: string;
  temperature: number;
  precipitation: number;
  uvIndex: number | null;
  weatherCode: number;
  isDay: boolean;
  windSpeed: number | null;
};

export type DailyForecastItem = {
  label: string;
  minTemperature: number;
  maxTemperature: number;
  precipitationTotal: number;
  maxUvIndex: number | null;
  weatherCode: number;
  maxWindSpeed: number | null;
};

export type WeatherForecast = {
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
};
