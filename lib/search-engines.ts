import searchEngineConfig from "@/search-engines.json";

type SearchEngineConfig = {
  name: string;
  nickname: string;
  "search-url": string;
  "suggestions-url": string | null;
};

export type SearchEngine = {
  name: string;
  nickname: string;
  searchUrl: string;
  suggestionsUrl: string | null;
};

export type SearchEngineClient = Pick<
  SearchEngine,
  "name" | "nickname" | "searchUrl"
>;

export const searchEngines: SearchEngine[] = (
  searchEngineConfig.searchEngines as SearchEngineConfig[]
).map((engine) => ({
  name: engine.name,
  nickname: engine.nickname,
  searchUrl: engine["search-url"],
  suggestionsUrl: engine["suggestions-url"],
}));

export const searchEnginesForClient: SearchEngineClient[] = searchEngines.map(
  ({ name, nickname, searchUrl }) => ({ name, nickname, searchUrl }),
);

export function getSearchEngine(nickname: string) {
  return searchEngines.find(
    (engine) => engine.nickname === nickname.toLowerCase(),
  );
}
