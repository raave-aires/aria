import type { SearchEngineNickname } from "@/lib/db/app-db";
import { getDb } from "@/lib/db/app-db";
import { searchEngines } from "@/lib/search-engines";
import { defaultSearchSettings } from "@/lib/settings/defaults";
import { writeSearchEngineCookie } from "@/lib/settings/persistence-cookie";

export function isKnownSearchEngine(nickname: string) {
  return searchEngines.some((engine) => engine.nickname === nickname);
}

export async function getSearchSettings() {
  const settings = await getDb().search.get("search");

  if (!settings || !isKnownSearchEngine(settings.lastEngine)) {
    return defaultSearchSettings;
  }

  return settings;
}

export async function setLastSearchEngine(lastEngine: SearchEngineNickname) {
  if (!isKnownSearchEngine(lastEngine)) {
    return defaultSearchSettings;
  }

  const settings = {
    id: "search" as const,
    lastEngine,
    updatedAt: new Date().toISOString(),
  };

  await getDb().search.put(settings);
  writeSearchEngineCookie(lastEngine);
  return settings;
}
