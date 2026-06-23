import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import type { CSSProperties } from "react";
import "./globals.css";
import { AppearanceProvider } from "@/components/providers/appearance-provider";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { getAccentForegroundRgb, hexToRgbTriplet } from "@/lib/settings/color";
import { defaultAppearanceSettings } from "@/lib/settings/defaults";
import {
  APPEARANCE_COOKIE,
  parseAppearanceCookie,
} from "@/lib/settings/persistence-cookie";
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aria",
  description: "sua nova aba personalizada",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialAppearance =
    parseAppearanceCookie(cookieStore.get(APPEARANCE_COOKIE)?.value) ??
    defaultAppearanceSettings;
  const rootStyle = {
    "--app-accent-rgb": hexToRgbTriplet(initialAppearance.accentColor),
    "--app-accent-foreground-rgb": getAccentForegroundRgb(
      initialAppearance.accentColor,
    ),
  } as CSSProperties;

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full overflow-x-hidden antialiased${initialAppearance.theme === "dark" ? " dark" : ""}`}
      data-theme={initialAppearance.theme}
      data-transparency={initialAppearance.transparency}
      data-blur={initialAppearance.blur}
      data-tint={initialAppearance.tint ? "on" : "off"}
      style={rootStyle}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme={initialAppearance.theme}
          enableSystem
          disableTransitionOnChange
        >
          <AppearanceProvider initialSettings={initialAppearance}>
            {children}
            <Toaster />
          </AppearanceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
