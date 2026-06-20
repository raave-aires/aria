"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { ImageUp, RotateCcw } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type {
  AccentMode,
  BlurLevel,
  ThemeMode,
  TransparencyLevel,
} from "@/lib/db/app-db";
import { getDb } from "@/lib/db/app-db";
import { extractAccentColorFromImageElement } from "@/lib/settings/accent";
import {
  getAppearanceSettings,
  updateAppearanceSettings,
} from "@/lib/settings/appearance-settings";
import {
  defaultAppearanceSettings,
  FALLBACK_ACCENT_COLOR,
} from "@/lib/settings/defaults";
import {
  getCurrentWallpaper,
  removeUserWallpaper,
  saveUserWallpaper,
  updateWallpaperAccent,
} from "@/lib/settings/wallpaper";

type Choice<T extends string> = {
  label: string;
  value: T;
};

const themeOptions: Choice<ThemeMode>[] = [
  { label: "Sistema", value: "system" },
  { label: "Claro", value: "light" },
  { label: "Escuro", value: "dark" },
];

const transparencyOptions: Choice<TransparencyLevel>[] = [
  { label: "Desligada", value: "off" },
  { label: "Baixa", value: "low" },
  { label: "Média", value: "medium" },
  { label: "Alta", value: "high" },
];

const blurOptions: Choice<BlurLevel>[] = [
  { label: "Desligado", value: "off" },
  { label: "Suave", value: "soft" },
  { label: "Médio", value: "medium" },
  { label: "Forte", value: "strong" },
];

function SettingChoices<T extends string>({
  label,
  options,
  value,
  onValueChange,
}: {
  label: string;
  options: Choice<T>[];
  value: T;
  onValueChange: (value: T) => void;
}) {
  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm font-medium">{label}</legend>
      <RadioGroup
        aria-label={label}
        className="grid grid-cols-2 gap-2"
        value={value}
        onValueChange={(nextValue) => onValueChange(nextValue as T)}
      >
        {options.map((option) => {
          const id = `${label}-${option.value}`;

          return (
            <Label
              key={option.value}
              htmlFor={id}
              className="surface-control cursor-pointer justify-between rounded-xl px-3 py-2 text-xs"
            >
              {option.label}
              <RadioGroupItem id={id} value={option.value} />
            </Label>
          );
        })}
      </RadioGroup>
    </fieldset>
  );
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

export function AppearancePopover({
  children,
}: {
  children: React.ReactElement;
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isProcessingWallpaper, setIsProcessingWallpaper] =
    React.useState(false);
  const settings =
    useLiveQuery(() => getDb().appearance.get("appearance"), []) ??
    defaultAppearanceSettings;
  const wallpaper = useLiveQuery(() => getDb().wallpapers.get("current"), []);

  async function setAccentMode(accentMode: AccentMode) {
    if (accentMode === "manual") {
      await updateAppearanceSettings({ accentMode });
      return;
    }

    const currentWallpaper = await getCurrentWallpaper();
    await updateAppearanceSettings({
      accentMode,
      accentColor: currentWallpaper?.accentColor ?? FALLBACK_ACCENT_COLOR,
    });
  }

  async function handleWallpaperChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file?.type.startsWith("image/")) {
      return;
    }

    setIsProcessingWallpaper(true);
    await saveUserWallpaper(file);

    const temporaryUrl = URL.createObjectURL(file);

    try {
      const image = await loadImage(temporaryUrl);
      const { accentColor, palette } =
        await extractAccentColorFromImageElement(image);
      await updateWallpaperAccent(accentColor, palette);

      const currentAppearance = await getAppearanceSettings();
      if (currentAppearance.accentMode === "auto") {
        await updateAppearanceSettings({ accentColor });
      }
    } finally {
      URL.revokeObjectURL(temporaryUrl);
      setIsProcessingWallpaper(false);
    }
  }

  async function resetWallpaper() {
    await removeUserWallpaper();

    const currentAppearance = await getAppearanceSettings();
    if (currentAppearance.accentMode === "auto") {
      await updateAppearanceSettings({ accentColor: FALLBACK_ACCENT_COLOR });
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align="end"
        className="surface-panel surface-tint max-h-[min(42rem,calc(100svh-2rem))] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto"
      >
        <PopoverHeader>
          <PopoverTitle>Aparência</PopoverTitle>
        </PopoverHeader>

        <SettingChoices
          label="Tema"
          options={themeOptions}
          value={settings.theme}
          onValueChange={(theme) => void updateAppearanceSettings({ theme })}
        />
        <SettingChoices
          label="Transparência"
          options={transparencyOptions}
          value={settings.transparency}
          onValueChange={(transparency) =>
            void updateAppearanceSettings({ transparency })
          }
        />
        <SettingChoices
          label="Desfoque"
          options={blurOptions}
          value={settings.blur}
          onValueChange={(blur) => void updateAppearanceSettings({ blur })}
        />

        <Separator />

        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="appearance-tint">Tint</Label>
          <Switch
            id="appearance-tint"
            checked={settings.tint}
            onCheckedChange={(tint) => void updateAppearanceSettings({ tint })}
          />
        </div>

        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium">Cor de destaque</legend>
          <RadioGroup
            aria-label="Modo da cor de destaque"
            className="grid grid-cols-2 gap-2"
            value={settings.accentMode}
            onValueChange={(accentMode) =>
              void setAccentMode(accentMode as AccentMode)
            }
          >
            <Label
              htmlFor="accent-auto"
              className="surface-control cursor-pointer justify-between rounded-xl px-3 py-2 text-xs"
            >
              Automática
              <RadioGroupItem id="accent-auto" value="auto" />
            </Label>
            <Label
              htmlFor="accent-manual"
              className="surface-control cursor-pointer justify-between rounded-xl px-3 py-2 text-xs"
            >
              Manual
              <RadioGroupItem id="accent-manual" value="manual" />
            </Label>
          </RadioGroup>
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="accent-color">Cor manual</Label>
            <input
              id="accent-color"
              aria-label="Cor de destaque manual"
              type="color"
              value={settings.accentColor}
              className="size-9 cursor-pointer rounded-lg border border-border bg-transparent p-1 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={settings.accentMode !== "manual"}
              onChange={(event) =>
                void updateAppearanceSettings({
                  accentMode: "manual",
                  accentColor: event.target.value,
                })
              }
            />
          </div>
        </fieldset>

        <Separator />

        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Wallpaper</p>
              <p className="text-xs text-muted-foreground">
                {wallpaper?.name ?? "Montanha padrão"}
              </p>
            </div>
            {wallpaper ? (
              <Button
                variant="ghost"
                size="icon-sm"
                className="accent-ring"
                aria-label="Restaurar wallpaper padrão"
                title="Restaurar padrão"
                onClick={() => void resetWallpaper()}
              >
                <RotateCcw />
              </Button>
            ) : null}
          </div>
          <input
            ref={fileInputRef}
            className="sr-only"
            type="file"
            accept="image/*"
            aria-label="Escolher imagem de wallpaper"
            onChange={handleWallpaperChange}
          />
          <Button
            type="button"
            variant="outline"
            className="surface-control accent-ring"
            disabled={isProcessingWallpaper}
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageUp />
            {isProcessingWallpaper ? "Preparando imagem…" : "Escolher imagem"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
