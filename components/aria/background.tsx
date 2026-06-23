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
	// `null` = still loading (default); `undefined` = no record; otherwise the record.
	const wallpaper = useLiveQuery(
		() => getDb().wallpapers.get("current"),
		[],
		null,
	);
	const [objectUrl, setObjectUrl] = useState<string>();

	// The component is ready to display when:
	//  - the DB query has resolved (wallpaper !== null), AND
	//  - if a wallpaper blob exists, its objectUrl has been created.
	const queryResolved = wallpaper !== null;
	const ready = queryResolved && (!wallpaper?.blob || Boolean(objectUrl));

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
			className={`z-0 object-cover transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`}
		/>
	);
}
