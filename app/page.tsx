import { Background } from "@/components/aria/background";
import { SettingsBallon } from "@/components/aria/settings-ballon";

export default function Home() {
  return (
    <main className="relative min-w-dvw min-h-dvh overflow-hidden">
      <Background />

      <div className="absolute inset-0 z-0 bg-black/10" />
      <section className="absolute z-10">
        <div className="fixed top-4 right-4">
          <SettingsBallon />
        </div>
      </section>
    </main>
  );
}
