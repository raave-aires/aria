"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useTheme } from "next-themes";
import type * as React from "react";
import { useEffect } from "react";

import { type AppearanceSettings, getDb } from "@/lib/db/app-db";
import { applyAppearanceSettings } from "@/lib/settings/appearance-settings";
import { defaultAppearanceSettings } from "@/lib/settings/defaults";
import { writeAppearanceCookie } from "@/lib/settings/persistence-cookie";

export function AppearanceProvider({
  children,
  initialSettings = defaultAppearanceSettings,
}: {
  children: React.ReactNode;
  initialSettings?: AppearanceSettings;
}) {
  const { setTheme } = useTheme();
  const savedSettings = useLiveQuery(
    () => getDb().appearance.get("appearance"),
    [],
  );
  const settings = savedSettings ?? initialSettings;

  useEffect(() => {
    applyAppearanceSettings(settings);
    setTheme(settings.theme);
  }, [setTheme, settings]);

  useEffect(() => {
    if (savedSettings) {
      writeAppearanceCookie(savedSettings);
    }
  }, [savedSettings]);

  return children;
}
