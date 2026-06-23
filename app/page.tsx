import { cookies } from "next/headers";
import { Background } from "@/components/aria/background";
import { SearchBar } from "@/components/aria/search-bar";
import { SettingsBallon } from "@/components/aria/settings-ballon";
import { WeatherWidget } from "@/components/widgets/weather/weather-widget";
import { WidgetBoard } from "@/components/widgets/widget-board";
import { getSearchEngine, searchEnginesForClient } from "@/lib/search-engines";
import { SEARCH_ENGINE_COOKIE } from "@/lib/settings/persistence-cookie";
import { getOpenMeteoForecast } from "@/lib/weather/open-meteo";
import {
	getWeatherSettings,
	WEATHER_COOKIE,
} from "@/lib/weather/weather-settings";

export default async function Home() {
	const cookieStore = await cookies();
	const initialEngineNickname = getSearchEngine(
		cookieStore.get(SEARCH_ENGINE_COOKIE)?.value ?? "",
	)?.nickname;
	const weatherSettings = getWeatherSettings(
		cookieStore.get(WEATHER_COOKIE)?.value,
	);
	const weatherForecast = await getOpenMeteoForecast(
		weatherSettings.location,
	).catch(() => null);

	return (
		<main className="relative min-w-dvw min-h-dvh overflow-x-hidden">
			<Background />

			<div className="scene-overlay absolute inset-0 z-0" />
			<div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl flex-col items-center gap-6 px-4 pt-[clamp(5rem,12svh,10rem)] pb-10 sm:px-10">
				<SearchBar
					engines={searchEnginesForClient}
					initialEngineNickname={initialEngineNickname}
				/>
				<WidgetBoard>
					<WeatherWidget
						forecast={weatherForecast}
						settings={weatherSettings}
					/>
				</WidgetBoard>
			</div>
			<div className="fixed top-4 right-4 z-20">
				<SettingsBallon />
			</div>
		</main>
	);
}
