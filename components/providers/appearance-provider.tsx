"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useTheme } from "next-themes";
import type * as React from "react";
import { useEffect } from "react";

import { getDb } from "@/lib/db/app-db";
import { applyAppearanceSettings } from "@/lib/settings/appearance-settings";
import { defaultAppearanceSettings } from "@/lib/settings/defaults";

export function AppearanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setTheme } = useTheme();
  const savedSettings = useLiveQuery(
    () => getDb().appearance.get("appearance"),
    [],
  );
  const settings = savedSettings ?? defaultAppearanceSettings;

  useEffect(() => {
    applyAppearanceSettings(settings);
    setTheme(settings.theme);
  }, [setTheme, settings]);

  return children;
}
