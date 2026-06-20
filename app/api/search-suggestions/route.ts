import { type NextRequest, NextResponse } from "next/server";

import { getSearchEngine } from "@/lib/search-engines";

const MAX_QUERY_LENGTH = 200;
const MAX_SUGGESTIONS = 8;

export const dynamic = "force-dynamic";

function emptySuggestions() {
  return NextResponse.json(
    { suggestions: [] },
    { headers: { "Cache-Control": "no-store" } },
  );
}

function extractSuggestions(payload: unknown) {
  if (!Array.isArray(payload) || !Array.isArray(payload[1])) {
    return [];
  }

  return [...new Set(payload[1])]
    .filter(
      (suggestion): suggestion is string =>
        typeof suggestion === "string" && suggestion.trim().length > 0,
    )
    .slice(0, MAX_SUGGESTIONS);
}

export async function GET(request: NextRequest) {
  const nickname = request.nextUrl.searchParams.get("engine") ?? "";
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!query || query.length > MAX_QUERY_LENGTH) {
    return emptySuggestions();
  }

  const engine = getSearchEngine(nickname);

  if (!engine?.suggestionsUrl) {
    return emptySuggestions();
  }

  const suggestionUrl = engine.suggestionsUrl.replace(
    "%s",
    encodeURIComponent(query),
  );

  try {
    const response = await fetch(suggestionUrl, {
      cache: "no-store",
      signal: AbortSignal.timeout(4_000),
    });

    if (!response.ok) {
      return emptySuggestions();
    }

    const payload: unknown = await response.json();

    return NextResponse.json(
      { suggestions: extractSuggestions(payload) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return emptySuggestions();
  }
}
