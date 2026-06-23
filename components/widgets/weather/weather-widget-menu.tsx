"use client";

import { Check, Ellipsis, Expand, MapPin, Minimize } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { saveWeatherWidgetPreferences } from "@/app/actions/weather";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LocationSearch } from "@/components/widgets/weather/location-search";
import type {
  WeatherLocation,
  WeatherWidgetPreferences,
  WeatherWidgetSize,
} from "@/lib/weather/types";
import { refreshWeather } from "@/lib/weather/refresh-weather";
import { RefreshButton } from "@/components/buttons/refresh";

export function WeatherWidgetMenu({
  preferences,
  location
}: {
  preferences: WeatherWidgetPreferences;
  location: WeatherLocation;
}) {
  const router = useRouter();
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function changeSize(size: WeatherWidgetSize) {
    if (size === preferences.size) {
      return;
    }

    startTransition(async () => {
      const result = await saveWeatherWidgetPreferences({
        ...preferences,
        size,
      });

      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-full"
            aria-label="Opções do widget de clima"
            disabled={isPending}
          >
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="surface-panel surface-tint w-52"
        >
          <DropdownMenuItem asChild>
            <RefreshButton onRefresh={refreshWeather.bind(null, location)} />
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setLocationDialogOpen(true)}>
            <MapPin />
            Alterar cidade
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => changeSize("regular")}>
            <Minimize />
            Compacto
            {preferences.size === "regular" ? (
              <Check className="ml-auto" />
            ) : null}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => changeSize("tall")}>
            <Expand />
            Detalhado
            {preferences.size === "tall" ? <Check className="ml-auto" /> : null}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent className="surface-panel surface-tint gap-4 rounded-3xl">
        <DialogHeader>
          <DialogTitle>Alterar cidade</DialogTitle>
          <DialogDescription>
            Escolha a cidade para atualizar a previsão deste widget.
          </DialogDescription>
        </DialogHeader>
        <LocationSearch onLocationSaved={() => setLocationDialogOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
