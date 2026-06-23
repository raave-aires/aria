import type { StaticImageData } from "next/image";
import Image from "next/image";
import dark01d from "@/assets/weather-symbols/darkmode/svg/01d.svg";
import dark01n from "@/assets/weather-symbols/darkmode/svg/01n.svg";
import dark02d from "@/assets/weather-symbols/darkmode/svg/02d.svg";
import dark02n from "@/assets/weather-symbols/darkmode/svg/02n.svg";
import dark03d from "@/assets/weather-symbols/darkmode/svg/03d.svg";
import dark03n from "@/assets/weather-symbols/darkmode/svg/03n.svg";
import dark04 from "@/assets/weather-symbols/darkmode/svg/04.svg";
import dark05d from "@/assets/weather-symbols/darkmode/svg/05d.svg";
import dark05n from "@/assets/weather-symbols/darkmode/svg/05n.svg";
import dark06d from "@/assets/weather-symbols/darkmode/svg/06d.svg";
import dark06n from "@/assets/weather-symbols/darkmode/svg/06n.svg";
import dark08d from "@/assets/weather-symbols/darkmode/svg/08d.svg";
import dark08n from "@/assets/weather-symbols/darkmode/svg/08n.svg";
import dark11 from "@/assets/weather-symbols/darkmode/svg/11.svg";
import dark34 from "@/assets/weather-symbols/darkmode/svg/34.svg";
import dark40d from "@/assets/weather-symbols/darkmode/svg/40d.svg";
import dark40n from "@/assets/weather-symbols/darkmode/svg/40n.svg";
import dark41d from "@/assets/weather-symbols/darkmode/svg/41d.svg";
import dark41n from "@/assets/weather-symbols/darkmode/svg/41n.svg";
import dark43d from "@/assets/weather-symbols/darkmode/svg/43d.svg";
import dark43n from "@/assets/weather-symbols/darkmode/svg/43n.svg";
import dark44d from "@/assets/weather-symbols/darkmode/svg/44d.svg";
import dark44n from "@/assets/weather-symbols/darkmode/svg/44n.svg";
import dark46 from "@/assets/weather-symbols/darkmode/svg/46.svg";
import dark47 from "@/assets/weather-symbols/darkmode/svg/47.svg";
import dark50 from "@/assets/weather-symbols/darkmode/svg/50.svg";
import light01d from "@/assets/weather-symbols/lightmode/svg/01d.svg";
import light01n from "@/assets/weather-symbols/lightmode/svg/01n.svg";
import light02d from "@/assets/weather-symbols/lightmode/svg/02d.svg";
import light02n from "@/assets/weather-symbols/lightmode/svg/02n.svg";
import light03d from "@/assets/weather-symbols/lightmode/svg/03d.svg";
import light03n from "@/assets/weather-symbols/lightmode/svg/03n.svg";
import light04 from "@/assets/weather-symbols/lightmode/svg/04.svg";
import light05d from "@/assets/weather-symbols/lightmode/svg/05d.svg";
import light05n from "@/assets/weather-symbols/lightmode/svg/05n.svg";
import light06d from "@/assets/weather-symbols/lightmode/svg/06d.svg";
import light06n from "@/assets/weather-symbols/lightmode/svg/06n.svg";
import light08d from "@/assets/weather-symbols/lightmode/svg/08d.svg";
import light08n from "@/assets/weather-symbols/lightmode/svg/08n.svg";
import light11 from "@/assets/weather-symbols/lightmode/svg/11.svg";
import light34 from "@/assets/weather-symbols/lightmode/svg/34.svg";
import light40d from "@/assets/weather-symbols/lightmode/svg/40d.svg";
import light40n from "@/assets/weather-symbols/lightmode/svg/40n.svg";
import light41d from "@/assets/weather-symbols/lightmode/svg/41d.svg";
import light41n from "@/assets/weather-symbols/lightmode/svg/41n.svg";
import light43d from "@/assets/weather-symbols/lightmode/svg/43d.svg";
import light43n from "@/assets/weather-symbols/lightmode/svg/43n.svg";
import light44d from "@/assets/weather-symbols/lightmode/svg/44d.svg";
import light44n from "@/assets/weather-symbols/lightmode/svg/44n.svg";
import light46 from "@/assets/weather-symbols/lightmode/svg/46.svg";
import light47 from "@/assets/weather-symbols/lightmode/svg/47.svg";
import light50 from "@/assets/weather-symbols/lightmode/svg/50.svg";
import { cn } from "@/lib/utils";
import { getWeatherSymbol } from "@/lib/weather/weather-symbols";

type ThemeAssets = {
  light: StaticImageData;
  dark: StaticImageData;
};

const iconAssets: Record<string, ThemeAssets> = {
  "01d": { light: light01d, dark: dark01d },
  "01n": { light: light01n, dark: dark01n },
  "02d": { light: light02d, dark: dark02d },
  "02n": { light: light02n, dark: dark02n },
  "03d": { light: light03d, dark: dark03d },
  "03n": { light: light03n, dark: dark03n },
  "04": { light: light04, dark: dark04 },
  "05d": { light: light05d, dark: dark05d },
  "05n": { light: light05n, dark: dark05n },
  "06d": { light: light06d, dark: dark06d },
  "06n": { light: light06n, dark: dark06n },
  "08d": { light: light08d, dark: dark08d },
  "08n": { light: light08n, dark: dark08n },
  "11": { light: light11, dark: dark11 },
  "34": { light: light34, dark: dark34 },
  "40d": { light: light40d, dark: dark40d },
  "40n": { light: light40n, dark: dark40n },
  "41d": { light: light41d, dark: dark41d },
  "41n": { light: light41n, dark: dark41n },
  "43d": { light: light43d, dark: dark43d },
  "43n": { light: light43n, dark: dark43n },
  "44d": { light: light44d, dark: dark44d },
  "44n": { light: light44n, dark: dark44n },
  "46": { light: light46, dark: dark46 },
  "47": { light: light47, dark: dark47 },
  "50": { light: light50, dark: dark50 },
};

export function WeatherIcon({
  weatherCode,
  isDay,
  className,
}: {
  weatherCode: number;
  isDay: boolean;
  className?: string;
}) {
  const symbol = getWeatherSymbol(weatherCode, isDay);
  const assets = iconAssets[symbol.asset] ?? iconAssets["04"];

  return (
    <span
      role="img"
      aria-label={symbol.label}
      className={cn("block", className)}
    >
      <Image
        src={assets.light}
        alt=""
        aria-hidden="true"
        className="size-full object-contain dark:hidden"
      />
      <Image
        src={assets.dark}
        alt=""
        aria-hidden="true"
        className="hidden size-full object-contain dark:block"
      />
    </span>
  );
}
