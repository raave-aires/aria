import { z } from "zod";

import type {
  WeatherForecastMode,
  WeatherLocation,
  WeatherSettings,
  WeatherWidgetPreferences,
  WeatherWidgetSize,
} from "@/lib/weather/types";

export const WEATHER_COOKIE = "aria-weather";
export const WEATHER_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const defaultWeatherLocation: WeatherLocation = {
  name: "Paragominas",
  latitude: -2.99565,
  longitude: -47.35488,
  timezone: "America/Belem",
};

export const defaultWeatherPreferences: WeatherWidgetPreferences = {
  size: "regular",
  forecastMode: "hours",
};

export const defaultWeatherSettings: WeatherSettings = {
  location: defaultWeatherLocation,
  preferences: defaultWeatherPreferences,
};

const locationSchema = z.object({
  name: z.string().trim().min(1).max(120),
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
  timezone: z.string().trim().min(1).max(120),
});

const preferencesSchema = z.object({
  size: z.enum(["regular", "tall"]),
  forecastMode: z.enum(["hours", "days"]),
});

const settingsSchema = z.object({
  location: locationSchema,
  preferences: preferencesSchema,
});

export function parseWeatherCookie(value: string | undefined) {
  if (!value) {
    return null;
  }

  try {
    return (
      settingsSchema.safeParse(JSON.parse(decodeURIComponent(value))).data ??
      null
    );
  } catch {
    return null;
  }
}

export function getWeatherSettings(value: string | undefined): WeatherSettings {
  return parseWeatherCookie(value) ?? defaultWeatherSettings;
}

export function serializeWeatherCookie(settings: WeatherSettings) {
  // `cookies().set()` performs HTTP cookie encoding itself. Encoding here as
  // well would leave a second layer for the next server render to decode.
  return JSON.stringify(settings);
}

export function isWeatherWidgetSize(value: string): value is WeatherWidgetSize {
  return value === "regular" || value === "tall";
}

export function isWeatherForecastMode(
  value: string,
): value is WeatherForecastMode {
  return value === "hours" || value === "days";
}

export { locationSchema, preferencesSchema };
