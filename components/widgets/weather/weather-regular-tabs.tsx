"use client";

import { CalendarDays, CloudSun } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	WeatherCurrentSummary,
	WeatherMetrics,
} from "@/components/widgets/weather/weather-current";
import { WeatherTabs } from "@/components/widgets/weather/weather-tabs";
import { WeatherWidgetMenu } from "@/components/widgets/weather/weather-widget-menu";
import type {
	WeatherForecast,
	WeatherLocation,
	WeatherWidgetPreferences,
} from "@/lib/weather/types";

type CompactWeatherTab = "primary" | "secondary";

function CompactTabButton({
	tab,
	activeTab,
	onSelect,
}: {
	tab: CompactWeatherTab;
	activeTab: CompactWeatherTab;
	onSelect: (tab: CompactWeatherTab) => void;
}) {
	const active = tab === activeTab;
	const isPrimary = tab === "primary";

	return (
		<Button
			type="button"
			role="tab"
			size="xs"
			variant={active ? "secondary" : "ghost"}
			aria-selected={active}
			aria-label={isPrimary ? "Mostrar resumo" : "Mostrar previsão"}
			title={isPrimary ? "Resumo" : "Previsão"}
			className="size-6 min-h-6 rounded-full p-0"
			onClick={() => onSelect(tab)}
		>
			{isPrimary ? (
				<CloudSun className="size-3.5" aria-hidden="true" />
			) : (
				<CalendarDays className="size-3.5" aria-hidden="true" />
			)}
		</Button>
	);
}

export function WeatherRegularTabs({
	forecast,
	locationName,
	preferences,
	location,
}: {
	forecast: WeatherForecast;
	locationName: string;
	preferences: WeatherWidgetPreferences;
	location: WeatherLocation;
}) {
	const [activeTab, setActiveTab] = useState<CompactWeatherTab>("primary");

	return (
		<section aria-label="Widget de clima" className="grid gap-5">
			<header className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					<h2 className="font-medium">Clima</h2>
					<div
						role="tablist"
						aria-label="Conteúdo do widget compacto"
						className="flex rounded-full bg-foreground/8 p-0.5"
					>
						<CompactTabButton
							tab="primary"
							activeTab={activeTab}
							onSelect={setActiveTab}
						/>
						<CompactTabButton
							tab="secondary"
							activeTab={activeTab}
							onSelect={setActiveTab}
						/>
					</div>
				</div>
				<WeatherWidgetMenu preferences={preferences} location={location} />
			</header>

			<div role="tabpanel">
				{activeTab === "primary" ? (
					<div className="grid gap-4">
						<WeatherCurrentSummary
							current={forecast.current}
							locationName={locationName}
						/>
						<WeatherMetrics current={forecast.current} />
					</div>
				) : (
					<WeatherTabs
						hourly={forecast.hourly}
						daily={forecast.daily}
						preferences={preferences}
					/>
				)}
			</div>
		</section>
	);
}
