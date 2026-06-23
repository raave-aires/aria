import { type NextRequest, NextResponse } from "next/server";

import { searchOpenMeteoLocations } from "@/lib/weather/open-meteo-geocoding";

const MIN_QUERY_LENGTH = 3;
const MAX_QUERY_LENGTH = 100;
const CACHE_CONTROL = "public, s-maxage=2592000, stale-while-revalidate=604800";

function emptyResults(cacheControl = "no-store") {
  return NextResponse.json(
    { results: [] },
    { headers: { "Cache-Control": cacheControl } },
  );
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < MIN_QUERY_LENGTH || query.length > MAX_QUERY_LENGTH) {
    return emptyResults();
  }

  try {
    const results = await searchOpenMeteoLocations(query);
    return NextResponse.json(
      { results },
      { headers: { "Cache-Control": CACHE_CONTROL } },
    );
  } catch {
    return emptyResults();
  }
}
