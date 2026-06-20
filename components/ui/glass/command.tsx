"use client";

import * as React from "react";
import {
  Command as BaseCommand,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput as BaseCommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export type CommandVariant = "glass" | "frosted" | "fluted" | "crystal";

export interface CommandProps extends React.ComponentProps<typeof BaseCommand> {
  variant?: CommandVariant;
  glow?: boolean;
}

/**
 * Glass UI Command - Enhanced command menu with glassy effects
 */
export const Command = React.forwardRef<
  React.ElementRef<typeof BaseCommand>,
  CommandProps
>(({ className, variant = "glass", glow = false, ...props }, ref) => {
  return (
    <BaseCommand
      ref={ref}
      className={cn(
        {
          "glass-bg": variant === "glass",
          "glass-frosted": variant === "frosted",
          "glass-fluted": variant === "fluted",
          "glass-crystal": variant === "crystal",
        },
        glow && "shadow-lg shadow-purple-500/20",
        className,
      )}
      {...props}
    />
  );
});
Command.displayName = "Command";

export interface CommandInputProps
  extends React.ComponentProps<typeof BaseCommandInput> {
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

const CommandInput = React.forwardRef<
  React.ElementRef<typeof BaseCommandInput>,
  CommandInputProps
>(({ className, leading, trailing, ...props }, ref) => {
  return (
    <div className="relative">
      {leading ? (
        <div className="absolute top-1/2 left-3 z-10 -translate-y-1/2">
          {leading}
        </div>
      ) : null}
      {trailing ? (
        <div className="absolute top-1/2 right-3 z-10 -translate-y-1/2">
          {trailing}
        </div>
      ) : null}
      <BaseCommandInput
        ref={ref}
        showSearchIcon={!leading && !trailing}
        className={cn(leading && "pl-12", trailing && "pr-12", className)}
        {...props}
      />
    </div>
  );
});
CommandInput.displayName = "CommandInput";

export {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
