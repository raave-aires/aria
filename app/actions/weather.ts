"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import type {
  WeatherLocation,
  WeatherWidgetPreferences,
} from "@/lib/weather/types";
import {
  type defaultWeatherSettings,
  getWeatherSettings,
  preferencesSchema,
  serializeWeatherCookie,
  WEATHER_COOKIE,
  WEATHER_COOKIE_MAX_AGE,
} from "@/lib/weather/weather-settings";

const weatherLocationSchema = z.object({
  name: z.string().trim().min(1).max(120),
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
  timezone: z.string().trim().min(1).max(120),
});

type WeatherActionResult = { ok: true } | { ok: false; message: string };

async function saveWeatherSettings(
  update: (
    settings: typeof defaultWeatherSettings,
  ) => typeof defaultWeatherSettings,
): Promise<WeatherActionResult> {
  const cookieStore = await cookies();
  const settings = getWeatherSettings(cookieStore.get(WEATHER_COOKIE)?.value);
  const nextSettings = update(settings);

  cookieStore.set(WEATHER_COOKIE, serializeWeatherCookie(nextSettings), {
    httpOnly: true,
    maxAge: WEATHER_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return { ok: true };
}

export async function saveWeatherLocation(
  location: WeatherLocation,
): Promise<WeatherActionResult> {
  const parsedLocation = weatherLocationSchema.safeParse(location);

  if (!parsedLocation.success) {
    return { ok: false, message: "Não foi possível salvar essa localização." };
  }

  return saveWeatherSettings((settings) => ({
    ...settings,
    location: parsedLocation.data,
  }));
}

export async function saveWeatherWidgetPreferences(
  preferences: WeatherWidgetPreferences,
): Promise<WeatherActionResult> {
  const parsedPreferences = preferencesSchema.safeParse(preferences);

  if (!parsedPreferences.success) {
    return {
      ok: false,
      message: "Não foi possível salvar a preferência do widget.",
    };
  }

  return saveWeatherSettings((settings) => ({
    ...settings,
    preferences: parsedPreferences.data,
  }));
}
