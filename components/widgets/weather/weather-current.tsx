import { CloudRainWind, Droplet, Sun } from "lucide-react";

import { WeatherIcon } from "@/components/widgets/weather/weather-icon";
import type { CurrentWeather } from "@/lib/weather/types";
import {
  formatPrecipitation,
  formatSpeed,
  formatTemperature,
  formatUvIndex,
} from "@/lib/weather/weather-utils";

function WeatherMetric({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail?: string | null;
}) {
  return (
    <div className="min-w-0 rounded-2xl bg-foreground/7 px-3 py-2.5">
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold tracking-tight">{value}</dd>
      {detail ? (
        <p className="text-[0.6875rem] text-muted-foreground">{detail}</p>
      ) : null}
    </div>
  );
}

export function WeatherCurrent({ current }: { current: CurrentWeather }) {
  return <WeatherCurrentSummary current={current} />;
}

export function WeatherCurrentSummary({
  current,
  locationName,
}: {
  current: CurrentWeather;
  locationName?: string;
}) {
  return (
    <div className="grid gap-4">
      <div>
        {locationName ? (
          <p className="mb-1 text-sm font-medium text-muted-foreground">
            {locationName}
          </p>
        ) : null}
        <p className="text-lg font-semibold tracking-tight">
          {current.conditionLabel}
        </p>
        <p className="text-sm text-muted-foreground">{current.dateLabel}</p>
      </div>

      <div className="flex items-center gap-4">
        <WeatherIcon
          weatherCode={current.weatherCode}
          isDay={current.isDay}
          className="size-24 shrink-0"
        />
        <div>
          <p className="text-5xl font-medium leading-none tracking-[-0.08em]">
            {formatTemperature(current.temperature)}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Sensação térmica:{" "}
            {current.apparentTemperature === null
              ? "—"
              : formatTemperature(current.apparentTemperature)}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Vento:{" "}
            {current.windSpeed === null
              ? "—"
              : formatSpeed(current.windSpeed)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function WeatherMetrics({ current }: { current: CurrentWeather }) {
  return (
    <dl className="grid min-w-0 grid-cols-3 gap-2">
      <WeatherMetric
        icon={<Droplet className="size-3.5" aria-hidden="true" />}
        label="Umidade"
        value={
          current.humidity === null
            ? "—"
            : formatTemperature(current.humidity)
        }
      />
      <WeatherMetric
        icon={<CloudRainWind className="size-3.5" aria-hidden="true" />}
        label="Chuva"
        value={formatPrecipitation(current.precipitation)}
      />
      <WeatherMetric
        icon={<Sun className="size-3.5" aria-hidden="true" />}
        label={`UV ${formatUvIndex(current.uvIndex)}`}
        value={current.uvLabel ?? "—"}
      />
    </dl>
  );
}
