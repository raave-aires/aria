import { CloudOff } from "lucide-react";

import { WeatherRegular } from "@/components/widgets/weather/weather-regular";
import { WeatherTall } from "@/components/widgets/weather/weather-tall";
import { WeatherWidgetMenu } from "@/components/widgets/weather/weather-widget-menu";
import {
	Widget,
	WidgetAction,
	WidgetContent,
	WidgetFooter,
	WidgetHeader,
	WidgetTitle,
} from "@/components/widgets/widget";
import type { WeatherForecast, WeatherSettings } from "@/lib/weather/types";

function WeatherUnavailable() {
	return (
		<div className="grid min-h-56 place-items-center gap-3 px-4 py-8 text-center">
			<CloudOff className="size-9 text-muted-foreground" aria-hidden="true" />
			<div>
				<p className="font-medium">
					Não foi possível carregar a previsão agora.
				</p>
				<p className="mt-1 text-sm text-muted-foreground">
					Tente novamente em alguns minutos ou escolha outra cidade.
				</p>
			</div>
		</div>
	);
}

export function WeatherWidget({
	forecast,
	settings,
}: {
	forecast: WeatherForecast | null;
	settings: WeatherSettings;
}) {
	const isTall = settings.preferences.size === "tall";
	const footer = forecast ? (
		<WidgetFooter className="text-[0.6875rem] text-muted-foreground">
			<a
				href="https://open-meteo.com/"
				target="_blank"
				rel="noreferrer"
				className="underline decoration-foreground/25 underline-offset-3 transition-colors hover:text-foreground"
			>
				Previsão do Open-Meteo
			</a>
			<span>Atualizado às {forecast.current.updatedLabel}</span>
		</WidgetFooter>
	) : null;

	return (
		<Widget data-testid="weather-widget" size={isTall ? "tall" : "regular"}>
			{forecast && !isTall ? (
				<WeatherRegular
					forecast={forecast}
					locationName={settings.location.name}
					preferences={settings.preferences}
					location={settings.location}
				/>
			) : (
				<>
					<WidgetHeader>
						<WidgetTitle>Clima</WidgetTitle>
						<WidgetAction>
							<WeatherWidgetMenu
								preferences={settings.preferences}
								location={settings.location}
							/>
						</WidgetAction>
					</WidgetHeader>

					<WidgetContent>
						{forecast ? (
							<WeatherTall
								forecast={forecast}
								preferences={settings.preferences}
								locationName={settings.location.name}
							/>
						) : (
							<WeatherUnavailable />
						)}
					</WidgetContent>
				</>
			)}
			{footer}
		</Widget>
	);
}
