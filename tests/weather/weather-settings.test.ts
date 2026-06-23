import { describe, expect, it } from "vitest";

import {
  defaultWeatherSettings,
  getWeatherSettings,
  parseWeatherCookie,
  serializeWeatherCookie,
} from "@/lib/weather/weather-settings";

describe("cookie de clima", () => {
  it("persiste localização e preferências no formato estruturado", () => {
    const value = serializeWeatherCookie({
      location: {
        name: "Tóquio",
        latitude: 35.6762,
        longitude: 139.6503,
        timezone: "Asia/Tokyo",
      },
      preferences: { size: "tall", forecastMode: "days" },
    });

    expect(parseWeatherCookie(value)).toEqual({
      location: {
        name: "Tóquio",
        latitude: 35.6762,
        longitude: 139.6503,
        timezone: "Asia/Tokyo",
      },
      preferences: { size: "tall", forecastMode: "days" },
    });
  });

  it("ignora cookies inválidos e retorna Paragominas como padrão", () => {
    expect(parseWeatherCookie("%7Binvalid")).toBeNull();
    expect(getWeatherSettings("%7Binvalid")).toEqual(defaultWeatherSettings);
  });
});
