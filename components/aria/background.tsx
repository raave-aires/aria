"use client";

import { useLiveQuery } from "dexie-react-hooks";
import Image, { type StaticImageData } from "next/image";
import { useEffect, useState } from "react";

import Default from "@/assets/images/mountain.webp";
import { getDb } from "@/lib/db/app-db";

interface BackgroundProps {
  src?: string | StaticImageData;
  alt?: string;
}

export function Background({
  src = Default,
  alt = "Imagem de uma montanha",
}: BackgroundProps) {
  const wallpaper = useLiveQuery(() => getDb().wallpapers.get("current"), []);
  const [objectUrl, setObjectUrl] = useState<string>();

  useEffect(() => {
    if (!wallpaper?.blob) {
      setObjectUrl(undefined);
      return;
    }

    const nextObjectUrl = URL.createObjectURL(wallpaper.blob);
    setObjectUrl(nextObjectUrl);

    // Object URLs retain their Blob until explicitly released.
    return () => URL.revokeObjectURL(nextObjectUrl);
  }, [wallpaper?.blob]);

  const defaultSource = typeof src === "string" ? src : src.src;

  return (
    <Image
      src={objectUrl ?? defaultSource}
      alt={alt}
      data-testid="wallpaper"
      fill
      sizes="100vw"
      priority
      unoptimized={Boolean(objectUrl)}
      className="z-0 object-cover"
    />
  );
}
