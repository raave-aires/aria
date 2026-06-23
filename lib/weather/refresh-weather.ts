"use server";

import { updateTag } from "next/cache";
import type { WeatherLocation } from "@/lib/weather/types";

export async function refreshWeather(location: WeatherLocation) {
  const latitude = location.latitude.toFixed(4);
  const longitude = location.longitude.toFixed(4);
  
  updateTag(`weather:${latitude}:${longitude}`);
}
