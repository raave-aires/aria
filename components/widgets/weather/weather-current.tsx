import { CloudRainWind, Droplet, Sun } from "lucide-react";

import { WeatherIcon } from "@/components/widgets/weather/weather-icon";
import type { CurrentWeather } from "@/lib/weather/types";
import {
	formatHumidity,
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
	compact = false,
	fill = false,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
	detail?: string | null;
	compact?: boolean;
	fill?: boolean;
}) {
	return (
		<div
			className={`min-w-0 rounded-2xl bg-foreground/7 ${compact ? "px-4 py-3" : "px-4 py-2.5"} ${fill ? "h-full" : ""}`}
		>
			<dt
				className={`flex items-center gap-1.5 text-muted-foreground ${compact ? "text-[0.6875rem]" : "text-xs"}`}
			>
				{icon}
				{label}
			</dt>
			<dd
				className={`font-semibold tracking-tight ${compact ? "mt-0.5 text-sm" : "mt-1 text-sm"}`}
			>
				{value}
			</dd>
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
	compact = false,
}: {
	current: CurrentWeather;
	locationName?: string;
	compact?: boolean;
}) {
	return (
		<div className={`grid ${compact ? "gap-2" : "gap-4"}`}>
			<div>
				{locationName ? (
					<p
						className={`font-medium text-muted-foreground ${compact ? "mb-0.5 text-sm" : "mb-1 text-sm"}`}
					>
						{locationName}
					</p>
				) : null}
				<p
					className={`font-semibold tracking-tight ${compact ? "text-xl" : "text-2xl"}`}
				>
					{current.conditionLabel}
				</p>
				<p
					className={`${compact ? "text-xs" : "text-sm"} text-muted-foreground`}
				>
					{current.dateLabel}
				</p>
			</div>

			<div className={`flex items-center ${compact ? "gap-3" : "gap-4"}`}>
				<WeatherIcon
					weatherCode={current.visualWeatherCode}
					isDay={current.isDay}
					className={compact ? "size-20 shrink-0" : "size-24 shrink-0"}
				/>
				<div>
					<p
						className={`${compact ? "text-4xl" : "text-5xl"} font-medium leading-none tracking-[-0.08em]`}
					>
						{formatTemperature(current.temperature)}
					</p>
					{compact ? null : (
						<WeatherReadingDetails current={current} compact={compact} />
					)}
				</div>
			</div>

			{compact ? <WeatherReadingDetails current={current} compact /> : null}
		</div>
	);
}

function WeatherReadingDetails({
	current,
	compact,
}: {
	current: CurrentWeather;
	compact: boolean;
}) {
	return (
		<div className={compact ? "grid gap-1" : "grid gap-2"}>
			<p className={`${compact ? "text-xs" : "text-sm"} text-muted-foreground`}>
				Sensação térmica:{" "}
				{current.apparentTemperature === null
					? "—"
					: formatTemperature(current.apparentTemperature)}
			</p>
			<p className={`${compact ? "text-xs" : "text-sm"} text-muted-foreground`}>
				Velocidade do vento:{" "}
				{current.windSpeed === null ? "—" : formatSpeed(current.windSpeed)}
			</p>
		</div>
	);
}

export function WeatherMetrics({
	current,
	compact = false,
	layout = "row",
}: {
	current: CurrentWeather;
	compact?: boolean;
	layout?: "row" | "column";
}) {
	return (
		<dl
			className={`grid min-w-0 gap-2 ${layout === "column" ? "h-full grid-cols-1 grid-rows-3" : "grid-cols-3"}`}
		>
			<WeatherMetric
				icon={<Droplet className="size-3.5" aria-hidden="true" />}
				label="Umidade"
				value={
					current.humidity === null ? "—" : formatHumidity(current.humidity)
				}
				compact={compact}
				fill={layout === "column"}
			/>
			<WeatherMetric
				icon={<CloudRainWind className="size-3.5" aria-hidden="true" />}
				label="Chuva"
				value={formatPrecipitation(current.precipitation)}
				compact={compact}
				fill={layout === "column"}
			/>
			<WeatherMetric
				icon={<Sun className="size-3.5" aria-hidden="true" />}
				label={`UV ${formatUvIndex(current.uvIndex)}`}
				value={current.uvLabel ?? "—"}
				compact={compact}
				fill={layout === "column"}
			/>
		</dl>
	);
}
