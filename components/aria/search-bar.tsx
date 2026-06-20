"use client";

import { Check, ChevronDown, LoaderCircle, Search } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import * as React from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import braveLogo from "@/assets/logos/brave.svg";
import duckDuckGoLogo from "@/assets/logos/duckduckgo.svg";
import googleLogo from "@/assets/logos/google.svg";
import kagiLogo from "@/assets/logos/kagi.svg";
import startpageLogo from "@/assets/logos/startpage.svg";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/glass/command";
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
  size?: "default" | "large";
}) {
  const logo = engineLogos[engine.nickname];
  const dimensions = size === "large" ? "size-6" : "size-5";

  if (logo) {
    return (
      <Image
        src={logo}
        alt=""
        aria-hidden="true"
        className={cn("shrink-0 rounded-full", dimensions)}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-foreground/10 font-mono text-[0.65rem] font-semibold text-foreground",
        dimensions,
      )}
    >
      {engine.nickname.toUpperCase()}
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
            payload.suggestions.filter(
              (suggestion): suggestion is string =>
                typeof suggestion === "string",
            ),
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
          className="command-frosted relative overflow-visible rounded-[1.5rem] p-0 text-foreground shadow-[0_8px_24px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.3)]"
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
                inputGroupClassName="h-10 rounded-[1.2rem] border-0 bg-transparent shadow-none"
                className="pl-14 pr-14 text-base placeholder:text-muted-foreground/85 sm:pl-52 sm:pr-14"
                leading={
                  <button
                    type="button"
                    aria-label={`Selecionar motor de busca: ${activeEngine.name}`}
                    aria-expanded={isEnginePickerOpen}
                    title="Selecionar motor de busca"
                    className="relative flex h-7 items-center gap-2 px-2 text-left outline-none transition-opacity hover:opacity-75 focus-visible:ring-2 focus-visible:ring-ring sm:px-3 sm:after:absolute sm:after:top-0.5 sm:after:-right-3 sm:after:h-6 sm:after:w-px sm:after:bg-foreground/20"
                    onClick={() => setIsEnginePickerOpen((isOpen) => !isOpen)}
                  >
                    <EngineLogo engine={activeEngine} />
                    <span className="hidden max-w-36 truncate text-sm font-medium sm:inline">
                      {activeEngine.name}
                    </span>
                    <ChevronDown className="hidden size-3.5 opacity-70 sm:block" />
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
            <CommandList className="glass-frosted command-frosted absolute top-[calc(100%+0.8rem)] right-0 left-0 z-30 max-h-[min(28rem,calc(100svh-12rem))] rounded-[1.5rem] p-2 shadow-2xl shadow-black/20 sm:right-auto sm:left-3 sm:w-80">
              <CommandGroup heading="Selecionar buscador">
                {engines.map((engine) => (
                  <CommandItem
                    key={engine.nickname}
                    value={engine.name}
                    className="min-h-11 rounded-xl bg-transparent px-3 py-2.5 text-sm data-selected:bg-white/15 data-selected:text-foreground"
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
                      <Check
                        className="ml-auto size-4"
                        aria-label="Selecionado"
                      />
                    ) : (
                      <CommandShortcut>{engine.nickname}</CommandShortcut>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          ) : null}

          {showSuggestionList ? (
            <CommandList className="glass-frosted command-frosted absolute top-[calc(100%+0.8rem)] right-0 left-0 z-30 max-h-[min(24rem,calc(100svh-12rem))] rounded-[1.5rem] p-2 shadow-2xl shadow-black/20">
              <CommandGroup
                heading={`Sugestões do ${resolvedSearch.engine.name}`}
              >
                {isLoadingSuggestions ? (
                  <div className="flex min-h-10 items-center gap-3 px-3 py-2 text-sm text-muted-foreground">
                    <LoaderCircle className="size-4 animate-spin" />
                    Buscando sugestões…
                  </div>
                ) : null}
                {suggestions.map((suggestion) => (
                  <CommandItem
                    key={suggestion}
                    value={suggestion}
                    className="min-h-10 rounded-xl bg-transparent px-3 py-2.5 text-sm data-selected:bg-white/15 data-selected:text-foreground"
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
