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

function getResponseEncoding(contentType: string | null) {
	const charset = contentType
		?.match(/charset\s*=\s*([^;]+)/i)?.[1]
		?.trim()
		.replace(/^['"]|['"]$/g, "")
		.toLowerCase();

	return charset === "iso-8859-1" || charset === "windows-1252"
		? charset
		: "utf-8";
}

async function parseSuggestionPayload(response: Response) {
	const body = await response.arrayBuffer();
	const encoding = getResponseEncoding(response.headers.get("content-type"));

	return JSON.parse(new TextDecoder(encoding).decode(body)) as unknown;
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

		const payload = await parseSuggestionPayload(response);

		return NextResponse.json(
			{ suggestions: extractSuggestions(payload) },
			{ headers: { "Cache-Control": "no-store" } },
		);
	} catch {
		return emptySuggestions();
	}
}
