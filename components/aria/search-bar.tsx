"use client";

import { Search } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import * as React from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import braveLogo from "@/assets/logos/brave.svg";
import duckDuckGoLogo from "@/assets/logos/duckduckgo.svg";
import googleLogo from "@/assets/logos/google.svg";
import kagiLogo from "@/assets/logos/kagi.svg";
import startpageLogo from "@/assets/logos/startpage.svg";
import wikipediaLogo from "@/assets/logos/wikipedia.svg";
import youtubeLogo from "@/assets/logos/youtube.svg";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/glass/command";
import { Spinner } from "@/components/ui/spinner";
import type { SearchEngineClient } from "@/lib/search-engines";
import { cn } from "@/lib/utils";

type SearchFormValues = {
  query: string;
  selectedEngineNickname: string;
};

type ResolvedSearch = {
  engine: SearchEngineClient;
  term: string;
};

const engineLogos: Partial<Record<string, StaticImageData>> = {
  b: braveLogo,
  d: duckDuckGoLogo,
  g: googleLogo,
  k: kagiLogo,
  s: startpageLogo,
  w: wikipediaLogo,
  y: youtubeLogo,
};

function resolveSearch(
  query: string,
  selectedEngineNickname: string,
  engines: SearchEngineClient[],
): ResolvedSearch | null {
  const selectedEngine = engines.find(
    (engine) => engine.nickname === selectedEngineNickname,
  );

  if (!selectedEngine) {
    return null;
  }

  const trimmedQuery = query.trim();
  const [possibleNickname, ...terms] = trimmedQuery.split(/\s+/);
  const overriddenEngine = engines.find(
    (engine) => engine.nickname === possibleNickname.toLowerCase(),
  );

  return {
    engine: overriddenEngine ?? selectedEngine,
    term: (overriddenEngine ? terms.join(" ") : trimmedQuery).trim(),
  };
}

function getSearchUrl(engine: SearchEngineClient, term: string) {
  return engine.searchUrl.replace("%s", encodeURIComponent(term));
}

function EngineLogo({
  engine,
  size = "default",
}: {
  engine: SearchEngineClient;
  size?: "compact" | "default" | "large";
}) {
  const logo = engineLogos[engine.nickname];
  const circleDimensions = size === "large" ? "size-8" : "size-7";
  const logoDimensions =
    size === "large"
      ? "size-[1.125rem]"
      : size === "compact"
        ? "size-[0.875rem]"
        : "size-4";

  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-full border border-white/40 bg-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] dark:border-white/20 dark:bg-white/10",
        circleDimensions,
      )}
    >
      {logo ? (
        <Image
          src={logo}
          alt=""
          aria-hidden="true"
          className={cn("object-contain", logoDimensions)}
        />
      ) : (
        <span className="font-mono text-[0.65rem] font-semibold text-foreground">
          {engine.nickname.toUpperCase()}
        </span>
      )}
    </span>
  );
}

export function SearchBar({ engines }: { engines: SearchEngineClient[] }) {
  const [isEnginePickerOpen, setIsEnginePickerOpen] = React.useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);

  const form = useForm<SearchFormValues>({
    defaultValues: {
      query: "",
      selectedEngineNickname: "d",
    },
  });

  const query = useWatch({ control: form.control, name: "query" });
  const selectedEngineNickname = useWatch({
    control: form.control,
    name: "selectedEngineNickname",
  });
  const resolvedSearch = React.useMemo(
    () => resolveSearch(query, selectedEngineNickname, engines),
    [engines, query, selectedEngineNickname],
  );
  const selectedEngine =
    engines.find((engine) => engine.nickname === selectedEngineNickname) ??
    engines[0];
  const activeEngine = resolvedSearch?.engine ?? selectedEngine;

  React.useEffect(() => {
    if (!resolvedSearch || resolvedSearch.term.length < 2) {
      setIsLoadingSuggestions(false);
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsLoadingSuggestions(true);

      try {
        const params = new URLSearchParams({
          engine: resolvedSearch.engine.nickname,
          q: resolvedSearch.term,
        });
        const response = await fetch(`/api/search-suggestions?${params}`, {
          signal: controller.signal,
        });
        const payload: unknown = await response.json();

        if (
          !controller.signal.aborted &&
          typeof payload === "object" &&
          payload !== null &&
          "suggestions" in payload &&
          Array.isArray(payload.suggestions)
        ) {
          setSuggestions(
            payload.suggestions
              .filter(
                (suggestion): suggestion is string =>
                  typeof suggestion === "string",
              )
              .slice(0, 6),
          );
        }
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingSuggestions(false);
        }
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [resolvedSearch]);

  function submitSearch(values: SearchFormValues) {
    const search = resolveSearch(
      values.query,
      values.selectedEngineNickname,
      engines,
    );

    if (!search?.term) {
      form.setError("query", {
        message: "Digite o que deseja pesquisar.",
      });
      return;
    }

    window.location.assign(getSearchUrl(search.engine, search.term));
  }

  if (!activeEngine) {
    return null;
  }

  const showSuggestionList =
    !isEnginePickerOpen &&
    resolvedSearch !== null &&
    resolvedSearch.term.length >= 2 &&
    (isLoadingSuggestions || suggestions.length > 0);

  return (
    <section className="mx-auto w-full max-w-4xl" aria-label="Pesquisa na web">
      <form onSubmit={form.handleSubmit(submitSearch)} noValidate>
        <Command
          variant="frosted"
          shouldFilter={false}
          className="relative overflow-visible rounded-[1.5rem] p-0 text-foreground"
        >
          <Controller
            control={form.control}
            name="query"
            rules={{
              validate: (value) =>
                value.trim().length > 0 || "Digite o que deseja pesquisar.",
            }}
            render={({ field: { onChange, ...field } }) => (
              <CommandInput
                {...field}
                aria-label="Buscar na web"
                aria-describedby={
                  form.formState.errors.query ? "search-error" : undefined
                }
                onValueChange={(value) => {
                  onChange(value);
                  setIsEnginePickerOpen(false);
                }}
                placeholder={`Pesquisar com ${activeEngine.name}`}
                wrapperClassName="p-1"
                inputGroupClassName="h-11 rounded-[1.2rem] border-0 bg-transparent shadow-none"
                className="pl-14 pr-14 text-base placeholder:text-muted-foreground/85"
                leading={
                  <button
                    type="button"
                    aria-label={`Selecionar motor de busca: ${activeEngine.name}`}
                    aria-expanded={isEnginePickerOpen}
                    title="Selecionar motor de busca"
                    className="grid size-9 place-items-center rounded-xl text-left outline-none transition-[background-color,transform] duration-200 hover:bg-foreground/10 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => setIsEnginePickerOpen((isOpen) => !isOpen)}
                  >
                    <EngineLogo engine={activeEngine} size="compact" />
                  </button>
                }
                trailing={
                  <button
                    type="submit"
                    aria-label="Pesquisar"
                    className="grid size-8 place-items-center rounded-full bg-foreground/10 text-foreground transition-colors hover:bg-foreground/20 focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Search className="size-4" />
                  </button>
                }
              />
            )}
          />

          {isEnginePickerOpen ? (
            <CommandList className="search-dropdown absolute top-[calc(100%+0.8rem)] right-0 left-0 z-30 max-h-[min(28rem,calc(100svh-12rem))] rounded-[1.5rem] p-2 backdrop-blur-lg backdrop-saturate-150 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:right-auto sm:left-3 sm:w-80">
              <CommandGroup
                heading="Selecionar buscador"
                className="[&_[cmdk-group-items]]:space-y-1"
              >
                {engines.map((engine) => (
                  <CommandItem
                    key={engine.nickname}
                    value={engine.name}
                    className="min-h-11 rounded-xl px-3 py-2.5 text-sm data-selected:text-foreground"
                    onSelect={() => {
                      form.setValue("selectedEngineNickname", engine.nickname, {
                        shouldDirty: true,
                      });
                      setIsEnginePickerOpen(false);
                    }}
                  >
                    <EngineLogo engine={engine} size="large" />
                    <span>{engine.name}</span>
                    {engine.nickname === activeEngine.nickname ? (
                      <span
                        data-slot="command-shortcut"
                        className="ml-auto rounded-full border border-foreground/15 bg-foreground/10 px-2 py-0.5 text-[0.6875rem] font-medium tracking-wide text-foreground"
                      >
                        Atual
                      </span>
                    ) : (
                      <CommandShortcut>{engine.nickname}</CommandShortcut>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          ) : null}

          {showSuggestionList ? (
            <CommandList className="search-dropdown absolute top-[calc(100%+0.8rem)] right-0 left-0 z-30 max-h-[min(24rem,calc(100svh-12rem))] rounded-[1.5rem] p-2 backdrop-blur-lg backdrop-saturate-150 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <CommandGroup
                heading={
                  <span className="flex w-full items-center justify-between gap-3">
                    <span>Sugestões do {resolvedSearch.engine.name}</span>
                    {isLoadingSuggestions ? (
                      <Spinner
                        aria-label="Buscando sugestões"
                        className="size-3.5"
                      />
                    ) : null}
                  </span>
                }
                className="[&_[cmdk-group-items]]:space-y-1"
              >
                {suggestions.map((suggestion) => (
                  <CommandItem
                    key={suggestion}
                    value={suggestion}
                    className="min-h-10 rounded-xl px-3 py-2.5 text-sm data-selected:text-foreground"
                    onSelect={() => {
                      form.setValue("query", suggestion, { shouldDirty: true });
                      window.location.assign(
                        getSearchUrl(resolvedSearch.engine, suggestion),
                      );
                    }}
                  >
                    <Search className="size-4 text-muted-foreground" />
                    {suggestion}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          ) : null}
        </Command>

        {form.formState.errors.query ? (
          <p
            id="search-error"
            role="alert"
            className="mt-2 px-4 text-sm text-destructive-foreground"
          >
            {form.formState.errors.query.message}
          </p>
        ) : null}
      </form>
    </section>
  );
}
