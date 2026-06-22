import { cookies } from "next/headers";
import { Background } from "@/components/aria/background";
import { SearchBar } from "@/components/aria/search-bar";
import { SettingsBallon } from "@/components/aria/settings-ballon";
import { getSearchEngine, searchEnginesForClient } from "@/lib/search-engines";
import { SEARCH_ENGINE_COOKIE } from "@/lib/settings/persistence-cookie";

export default async function Home() {
  const cookieStore = await cookies();
  const initialEngineNickname = getSearchEngine(
    cookieStore.get(SEARCH_ENGINE_COOKIE)?.value ?? "",
  )?.nickname;

  return (
    <main className="relative min-w-dvw min-h-dvh overflow-hidden">
      <Background />

      <div className="scene-overlay absolute inset-0 z-0" />
      <section className="absolute inset-x-0 top-[12svh] z-10 px-4 sm:px-10">
        <SearchBar
          engines={searchEnginesForClient}
          initialEngineNickname={initialEngineNickname}
        />
      </section>
      <section className="absolute z-10">
        <div className="fixed top-4 right-4">
          <SettingsBallon />
        </div>
      </section>
    </main>
  );
}
