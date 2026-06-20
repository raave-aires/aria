import { Background } from "@/components/aria/background";
import { SearchBar } from "@/components/aria/search-bar";
import { SettingsBallon } from "@/components/aria/settings-ballon";
import { searchEnginesForClient } from "@/lib/search-engines";

export default function Home() {
  return (
    <main className="relative min-w-dvw min-h-dvh overflow-hidden">
      <Background />

      <div className="absolute inset-0 z-0 bg-black/10" />
      <section className="absolute inset-x-0 top-[12svh] z-10 px-4 sm:px-10">
        <SearchBar engines={searchEnginesForClient} />
      </section>
      <section className="absolute z-10">
        <div className="fixed top-4 right-4">
          <SettingsBallon />
        </div>
      </section>
    </main>
  );
}
