import { describe, expect, it } from "vitest";

import { getWeatherSymbol } from "@/lib/weather/weather-symbols";

describe("símbolos WMO", () => {
  it("seleciona variações diurnas e noturnas", () => {
    expect(getWeatherSymbol(0, true)).toMatchObject({
      asset: "01d",
      label: "Céu limpo",
    });
    expect(getWeatherSymbol(0, false)).toMatchObject({
      asset: "01n",
      label: "Céu limpo",
    });
  });

  it("mantém um fallback legível para códigos desconhecidos", () => {
    expect(getWeatherSymbol(999, true)).toEqual({
      asset: "04",
      label: "Condições variáveis",
    });
  });
});
