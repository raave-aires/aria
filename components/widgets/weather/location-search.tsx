"use client";

import { LoaderCircle, MapPin, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { saveWeatherLocation } from "@/app/actions/weather";
import { Input } from "@/components/ui/input";
import type { WeatherLocationSearchResult } from "@/lib/weather/types";
import { Spinner } from "@/components/ui/spinner";

const MIN_QUERY_LENGTH = 3;

type SearchStatus = "idle" | "loading" | "empty" | "error";

export function LocationSearch({
  onLocationSaved,
}: {
  onLocationSaved: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WeatherLocationSearchResult[]>([]);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setStatus("idle");
      setMessage(null);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setStatus("loading");
      setMessage(null);

      try {
        const response = await fetch(
          `/api/geocode?q=${encodeURIComponent(trimmedQuery)}`,
          {
            signal: controller.signal,
          },
        );
        const payload: unknown = await response.json();

        if (
          !response.ok ||
          typeof payload !== "object" ||
          payload === null ||
          !("results" in payload) ||
          !Array.isArray(payload.results)
        ) {
          throw new Error("Resposta de geocodificação inválida.");
        }

        const nextResults = payload.results.filter(
          (result): result is WeatherLocationSearchResult =>
            typeof result === "object" &&
            result !== null &&
            "name" in result &&
            "label" in result &&
            "latitude" in result &&
            "longitude" in result &&
            "timezone" in result &&
            typeof result.name === "string" &&
            typeof result.label === "string" &&
            typeof result.latitude === "number" &&
            typeof result.longitude === "number" &&
            typeof result.timezone === "string",
        );

        if (controller.signal.aborted) {
          return;
        }

        setResults(nextResults);
        setStatus(nextResults.length > 0 ? "idle" : "empty");
      } catch {
        if (!controller.signal.aborted) {
          setResults([]);
          setStatus("error");
          setMessage("Não foi possível buscar cidades agora.");
        }
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [query]);

  function selectLocation(location: WeatherLocationSearchResult) {
    startTransition(async () => {
      const result = await saveWeatherLocation({
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: location.timezone,
      });

      if (!result.ok) {
        setMessage(result.message);
        return;
      }

      onLocationSaved();
      router.refresh();
    });
  }

  const queryIsShort =
    query.trim().length > 0 && query.trim().length < MIN_QUERY_LENGTH;

  return (
    <div className="grid gap-3">
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Digite uma cidade"
          aria-label="Buscar cidade"
          aria-describedby="location-search-status"
          className="surface-control h-11 rounded-2xl pl-10"
          disabled={isPending}
        />
      </div>

      <div
        id="location-search-status"
        aria-live="polite"
        className="min-h-5 text-xs text-muted-foreground"
      >
        {queryIsShort ? "Digite ao menos 3 caracteres." : null}
        {status === "loading" ? (
          <span className="inline-flex items-center gap-1.5">
            <Spinner />
          </span>
        ) : null}
        {status === "empty" ? "Não encontrei essa cidade." : null}
        {status === "error" ? message : null}
      </div>

      {results.length > 0 ? (
        <div
          role="listbox"
          aria-label="Resultados de cidades"
          className="grid max-h-64 gap-1 overflow-y-auto"
        >
          {results.map((location) => (
            <div
              key={`${location.latitude}:${location.longitude}:${location.timezone}`}
            >
              <button
                type="button"
                role="option"
                aria-selected="false"
                disabled={isPending}
                onClick={() => selectLocation(location)}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <MapPin
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {location.name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {location.label}
                  </span>
                </span>
                {isPending ? (
                  <LoaderCircle
                    className="ml-auto size-4 animate-spin"
                    aria-label="Salvando localização"
                  />
                ) : null}
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {message && status !== "error" ? (
        <p role="alert" className="text-xs text-destructive">
          {message}
        </p>
      ) : null}
    </div>
  );
}
