import { CloudOff } from "lucide-react";

import { WeatherRegular } from "@/components/widgets/weather/weather-regular";
import { WeatherTall } from "@/components/widgets/weather/weather-tall";
import { WeatherWidgetMenu } from "@/components/widgets/weather/weather-widget-menu";
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

  return (
    <article
      data-testid="weather-widget"
      className={`surface-panel surface-widget surface-tint flex w-full self-start flex-col overflow-hidden rounded-3xl ${isTall ? "max-w-sm min-w-0" : "max-w-sm"}`}
    >
      {forecast && !isTall ? (
        <div className="min-w-0 px-5 pt-4 pb-4">
          <WeatherRegular
            forecast={forecast}
            locationName={settings.location.name}
            preferences={settings.preferences}
            location={settings.location}
          />
        </div>
      ) : (
        <>
          <header className="flex items-center justify-between gap-3 px-5 pt-4">
            <h2 className="font-medium">Clima</h2>
            <WeatherWidgetMenu preferences={settings.preferences} location={settings.location} />
          </header>

          <div className="min-w-0 px-5 pt-5 pb-4">
            {forecast ? (
              <WeatherTall
                forecast={forecast}
                preferences={settings.preferences}
                locationName={settings.location.name}
              />
            ) : (
              <WeatherUnavailable />
            )}
          </div>
        </>
      )}

      {forecast ? (
        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-foreground/10 px-5 py-3 text-[0.6875rem] text-muted-foreground">
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-foreground/25 underline-offset-3 transition-colors hover:text-foreground"
          >
            Previsão do Open-Meteo
          </a>
          <span>Atualizado às {forecast.current.updatedLabel}</span>
        </footer>
      ) : null}
    </article>
  );
}
