"use client";

import { ChevronRight, Droplets, Sun } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";

import { saveWeatherWidgetPreferences } from "@/app/actions/weather";
import { Button } from "@/components/ui/button";
import { WeatherIcon } from "@/components/widgets/weather/weather-icon";
import type {
	DailyForecastItem,
	HourlyForecastItem,
	WeatherForecastMode,
	WeatherWidgetPreferences,
} from "@/lib/weather/types";
import {
	formatPrecipitation,
	formatTemperature,
	formatUvIndex,
} from "@/lib/weather/weather-utils";

function ForecastModeButton({
	mode,
	activeMode,
	onSelect,
}: {
	mode: WeatherForecastMode;
	activeMode: WeatherForecastMode;
	onSelect: (mode: WeatherForecastMode) => void;
}) {
	const active = mode === activeMode;

	return (
		<Button
			type="button"
			role="tab"
			size="xs"
			variant={active ? "secondary" : "ghost"}
			aria-selected={active}
			className="min-h-8 rounded-full px-3"
			onClick={() => onSelect(mode)}
		>
			{mode === "hours" ? "Horas" : "Dias"}
		</Button>
	);
}

function HourlyForecast({ items }: { items: HourlyForecastItem[] }) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const [hasMoreToShow, setHasMoreToShow] = useState(false);

	useEffect(() => {
		const scroller = scrollRef.current;

		if (!scroller) {
			return;
		}

		const element = scroller;

		function updateScrollAffordance() {
			setHasMoreToShow(
				element.scrollLeft + element.clientWidth < element.scrollWidth - 4,
			);
		}

		updateScrollAffordance();
		element.addEventListener("scroll", updateScrollAffordance, {
			passive: true,
		});
		const resizeObserver = new ResizeObserver(updateScrollAffordance);
		resizeObserver.observe(element);

		return () => {
			element.removeEventListener("scroll", updateScrollAffordance);
			resizeObserver.disconnect();
		};
	}, []);

	return (
		<div className="relative min-w-0">
			<div
				ref={scrollRef}
				className="weather-hourly-scroll flex min-w-0 snap-x snap-mandatory gap-2 overflow-x-auto overflow-y-hidden pr-5 pb-1 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
			>
				{items.map((item) => (
					<article
						key={item.timeLabel}
						className="grid shrink-0 basis-[calc((100%-1rem)/3)] snap-start justify-items-center gap-2 rounded-2xl bg-foreground/7 px-2 py-3 text-center"
					>
						<p className="text-xs font-medium text-muted-foreground">
							{item.timeLabel}
						</p>
						<WeatherIcon
							weatherCode={item.weatherCode}
							isDay={item.isDay}
							className="size-9"
						/>
						<p className="text-sm font-semibold">
							{formatTemperature(item.temperature)}
						</p>
						<p className="flex items-center gap-1 text-[0.6875rem] text-muted-foreground">
							<Droplets className="size-3" aria-hidden="true" />
							{formatPrecipitation(item.precipitation)}
						</p>
						<p className="flex items-center gap-1 text-[0.6875rem] text-muted-foreground">
							<Sun className="size-3" aria-hidden="true" />
							{formatUvIndex(item.uvIndex)}
						</p>
					</article>
				))}
			</div>
			{hasMoreToShow ? (
				<span
					data-testid="weather-hours-more"
					aria-hidden="true"
					className="surface-widget pointer-events-none absolute top-1/2 right-1 grid size-8 -translate-y-1/2 place-items-center rounded-full border border-foreground/10 text-foreground shadow-lg"
				>
					<ChevronRight className="size-4" />
				</span>
			) : null}
		</div>
	);
}

function DailyForecast({ items }: { items: DailyForecastItem[] }) {
	return (
		<div className="weather-daily-scroll grid h-full min-w-0 gap-2 overflow-y-auto pr-1 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
			{items.map((item) => (
				<article
					key={item.label}
					className="grid grid-cols-[minmax(4.5rem,1fr)_2rem_auto] items-center gap-3 rounded-2xl bg-foreground/7 px-3 py-2.5"
				>
					<p className="text-sm font-medium">{item.label}</p>
					<WeatherIcon
						weatherCode={item.weatherCode}
						isDay
						className="size-8"
					/>
					<div className="justify-self-end text-right">
						<p className="text-sm font-semibold">
							{formatTemperature(item.minTemperature)} /{" "}
							{formatTemperature(item.maxTemperature)}
						</p>
						<p className="text-xs text-muted-foreground">
							UV {formatUvIndex(item.maxUvIndex)} ·{" "}
							{formatPrecipitation(item.precipitationTotal)}
						</p>
					</div>
				</article>
			))}
		</div>
	);
}

export function WeatherTabs({
	hourly,
	daily,
	preferences,
}: {
	hourly: HourlyForecastItem[];
	daily: DailyForecastItem[];
	preferences: WeatherWidgetPreferences;
}) {
	const [mode, setMode] = useState(preferences.forecastMode);
	const [, startTransition] = useTransition();

	function selectMode(nextMode: WeatherForecastMode) {
		if (nextMode === mode) {
			return;
		}

		setMode(nextMode);
		startTransition(async () => {
			await saveWeatherWidgetPreferences({
				...preferences,
				forecastMode: nextMode,
			});
		});
	}

	return (
		<section aria-label="Previsão detalhada" className="grid min-w-0 gap-3">
			<div
				role="tablist"
				aria-label="Período da previsão"
				className="flex w-fit rounded-full bg-foreground/8 p-1"
			>
				<ForecastModeButton
					mode="hours"
					activeMode={mode}
					onSelect={selectMode}
				/>
				<ForecastModeButton
					mode="days"
					activeMode={mode}
					onSelect={selectMode}
				/>
			</div>
			<div role="tabpanel" className="h-40 min-w-0 overflow-hidden">
				{mode === "hours" ? (
					<HourlyForecast items={hourly} />
				) : (
					<DailyForecast items={daily} />
				)}
			</div>
		</section>
	);
}
