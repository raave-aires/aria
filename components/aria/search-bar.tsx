"use client";

import { useLiveQuery } from "dexie-react-hooks";
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
} from "@/components/ui/command";
import { Spinner } from "@/components/ui/spinner";
import { getDb } from "@/lib/db/app-db";
import type { SearchEngineClient } from "@/lib/search-engines";
import { writeSearchEngineCookie } from "@/lib/settings/persistence-cookie";
import { setLastSearchEngine } from "@/lib/settings/search-settings";
import { cn } from "@/lib/utils";

type SearchFormValues = {
  query: string;
  selectedEngineNickname: string;
};

type ResolvedSearch = {
  engine: SearchEngineClient;
  term: string;
};

type OpenSearchDropdown = "engines" | "suggestions" | null;

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
          loading="eager"
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

export function SearchBar({
  engines,
  initialEngineNickname = "d",
}: {
  engines: SearchEngineClient[];
  initialEngineNickname?: string;
}) {
  const searchRegionRef = React.useRef<HTMLElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [openDropdown, setOpenDropdown] =
    React.useState<OpenSearchDropdown>(null);
  const [hasKeyboardSelection, setHasKeyboardSelection] = React.useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);

  const form = useForm<SearchFormValues>({
    defaultValues: {
      query: "",
      selectedEngineNickname: engines.some(
        (engine) => engine.nickname === initialEngineNickname,
      )
        ? initialEngineNickname
        : "d",
    },
  });
  const savedSearchSettings = useLiveQuery(
    () => getDb().search.get("search"),
    [],
  );

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
    const lastEngine = savedSearchSettings?.lastEngine;

    if (
      lastEngine &&
      engines.some((engine) => engine.nickname === lastEngine)
    ) {
      form.setValue("selectedEngineNickname", lastEngine);
      writeSearchEngineCookie(lastEngine);
    }
  }, [engines, form, savedSearchSettings?.lastEngine]);

  React.useEffect(() => {
    function closeDropdownOnOutsidePress(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !searchRegionRef.current?.contains(event.target)
      ) {
        setOpenDropdown(null);
        setHasKeyboardSelection(false);
      }
    }

    document.addEventListener("pointerdown", closeDropdownOnOutsidePress);
    return () =>
      document.removeEventListener("pointerdown", closeDropdownOnOutsidePress);
  }, []);

  React.useEffect(() => {
    if (!resolvedSearch || resolvedSearch.term.length < 2) {
      setIsLoadingSuggestions(false);
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    setIsLoadingSuggestions(true);
    setSuggestions([]);
    const timeout = window.setTimeout(async () => {
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

    setOpenDropdown(null);
    setHasKeyboardSelection(false);

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
    openDropdown === "suggestions" &&
    resolvedSearch !== null &&
    resolvedSearch.term.length >= 2 &&
    (isLoadingSuggestions || suggestions.length > 0);

  return (
    <section
      ref={searchRegionRef}
      className="mx-auto w-full max-w-4xl"
      aria-label="Pesquisa na web"
    >
      <form onSubmit={form.handleSubmit(submitSearch)} noValidate>
        <Command
          shouldFilter={false}
          className="search-shell surface-glass surface-tint relative overflow-visible rounded-[1.5rem] p-0 text-foreground"
        >
          <Controller
            control={form.control}
            name="query"
            rules={{
              validate: (value) =>
                value.trim().length > 0 || "Digite o que deseja pesquisar.",
            }}
            render={({ field: { onChange, ...field } }) => (
              <div className="relative">
                <CommandInput
                  {...field}
                  ref={searchInputRef}
                  aria-label="Buscar na web"
                  aria-expanded={openDropdown !== null}
                  aria-describedby={
                    form.formState.errors.query ? "search-error" : undefined
                  }
                  onValueChange={(value) => {
                    onChange(value);
                    setHasKeyboardSelection(false);
                    const nextSearch = resolveSearch(
                      value,
                      selectedEngineNickname,
                      engines,
                    );
                    setOpenDropdown(
                      nextSearch?.term.length && nextSearch.term.length >= 2
                        ? "suggestions"
                        : null,
                    );
                  }}
                  onFocus={() => {
                    if (
                      resolvedSearch?.term.length &&
                      resolvedSearch.term.length >= 2
                    ) {
                      setOpenDropdown("suggestions");
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setOpenDropdown(null);
                      setHasKeyboardSelection(false);
                      return;
                    }

                    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                      if (
                        openDropdown === null &&
                        resolvedSearch?.term.length &&
                        resolvedSearch.term.length >= 2
                      ) {
                        setOpenDropdown("suggestions");
                      } else if (openDropdown !== null) {
                        setHasKeyboardSelection(true);
                      }

                      return;
                    }

                    if (event.key !== "Enter") {
                      return;
                    }

                    if (
                      openDropdown === "engines" ||
                      (openDropdown === "suggestions" && hasKeyboardSelection)
                    ) {
                      return;
                    }

                    event.preventDefault();
                    setOpenDropdown(null);
                    void form.handleSubmit(submitSearch)();
                  }}
                  placeholder={`Pesquisar com ${activeEngine.name}`}
                  showSearchIcon={false}
                  wrapperClassName="p-0"
                  inputGroupClassName="search-input-control surface-control h-11 rounded-[1.2rem] shadow-none"
                  className="pl-14 pr-14 text-base placeholder:text-muted-foreground/85"
                />
                <div className="absolute top-1/2 left-3 z-10 -translate-y-1/2">
                  <button
                    type="button"
                    aria-label={`Selecionar motor de busca: ${activeEngine.name}`}
                    aria-expanded={openDropdown === "engines"}
                    aria-haspopup="listbox"
                    title="Selecionar motor de busca"
                    className="grid size-9 place-items-center rounded-xl text-left outline-none transition-[background-color,transform] duration-200 hover:bg-foreground/10 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => {
                      setHasKeyboardSelection(false);
                      setOpenDropdown((currentDropdown) =>
                        currentDropdown === "engines" ? null : "engines",
                      );
                    }}
                    onKeyDown={(event) => {
                      if (
                        event.key !== "ArrowDown" &&
                        event.key !== "ArrowUp"
                      ) {
                        return;
                      }

                      event.preventDefault();
                      setOpenDropdown("engines");
                      setHasKeyboardSelection(false);
                      window.requestAnimationFrame(() =>
                        searchInputRef.current?.focus(),
                      );
                    }}
                  >
                    <EngineLogo engine={activeEngine} size="compact" />
                  </button>
                </div>
                <div className="absolute top-1/2 right-3 z-10 -translate-y-1/2">
                  <button
                    type="submit"
                    aria-label="Pesquisar"
                    className="grid size-8 place-items-center rounded-full bg-foreground/10 text-foreground transition-colors hover:bg-foreground/20 focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Search className="size-4" />
                  </button>
                </div>
              </div>
            )}
          />

          {openDropdown === "engines" ? (
            <CommandList
              label="Motores de busca"
              className="surface-panel surface-tint absolute top-[calc(100%+0.8rem)] right-0 left-0 z-30 max-h-[min(28rem,calc(100svh-12rem))] rounded-[1.5rem] p-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:right-auto sm:left-3 sm:w-80"
            >
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
                      void setLastSearchEngine(engine.nickname);
                      setOpenDropdown(null);
                      setHasKeyboardSelection(false);
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
            <CommandList
              label={`Sugestões do ${resolvedSearch.engine.name}`}
              className="surface-panel surface-tint absolute top-[calc(100%+0.8rem)] right-0 left-0 z-30 max-h-[min(24rem,calc(100svh-12rem))] rounded-[1.5rem] p-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {isLoadingSuggestions ? (
                <div className="flex items-center justify-end px-3 py-2">
                  <Spinner
                    aria-label="Buscando sugestões"
                    className="size-3.5"
                  />
                </div>
              ) : null}
              {suggestions.length > 0 ? (
                <CommandGroup
                  heading={`Sugestões do ${resolvedSearch.engine.name}`}
                  className="[&_[cmdk-group-items]]:space-y-1"
                >
                  {suggestions.map((suggestion) => (
                    <CommandItem
                      key={suggestion}
                      value={suggestion}
                      className="min-h-10 rounded-xl px-3 py-2.5 text-sm data-selected:text-foreground"
                      onSelect={() => {
                        setOpenDropdown(null);
                        setHasKeyboardSelection(false);
                        form.setValue("query", suggestion, {
                          shouldDirty: true,
                        });
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
              ) : null}
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
