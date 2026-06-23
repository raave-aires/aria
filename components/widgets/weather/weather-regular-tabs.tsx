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
import {
	WidgetAction,
	WidgetContent,
	WidgetHeader,
	WidgetTitle,
} from "@/components/widgets/widget";
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
		<>
			<WidgetHeader>
				<div className="flex items-center gap-2">
					<WidgetTitle>Clima</WidgetTitle>
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
				<WidgetAction>
					<WeatherWidgetMenu preferences={preferences} location={location} />
				</WidgetAction>
			</WidgetHeader>

			<WidgetContent aria-label="Widget de clima">
				<div role="tabpanel" className="h-full min-h-0">
					{activeTab === "primary" ? (
						<div className="grid h-full grid-cols-[minmax(0,1fr)_7.25rem] items-center gap-3">
							<WeatherCurrentSummary
								current={forecast.current}
								locationName={locationName}
								compact
							/>
							<WeatherMetrics
								current={forecast.current}
								compact
								layout="column"
							/>
						</div>
					) : (
						<WeatherTabs
							hourly={forecast.hourly}
							daily={forecast.daily}
							preferences={preferences}
						/>
					)}
				</div>
			</WidgetContent>
		</>
	);
}
