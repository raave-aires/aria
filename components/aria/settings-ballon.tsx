"use client";

import { Settings } from "lucide-react";

import { AppearancePopover } from "@/components/settings/appearance-popover";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function SettingsBallon() {
  return (
    <Card className="surface-glass surface-tint w-fit gap-0 overflow-visible rounded-2xl py-1">
      <CardContent className="flex items-center gap-1 px-1">
        <ThemeToggle />

        <AppearancePopover>
          <Button
            variant="outline"
            size="icon"
            className="surface-control accent-ring rounded-full"
            aria-label="Abrir configurações de aparência"
          >
            <Settings />
          </Button>
        </AppearancePopover>
      </CardContent>
    </Card>
  );
}
