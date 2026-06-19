import Image, { type StaticImageData } from "next/image";
import Default from "@/assets/images/mountain.webp"

interface BackgroundProps {
  src?: string | StaticImageData;
  alt?: string;
}

// TODO: permitir que o usuário escolha a imagem de fundo, talvez usando uma API de imagens ou permitindo uploads personalizados.

export function Background({ src = Default, alt = "Imagem de uma montanha" }: BackgroundProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="100vw"
      priority
      className="object-cover z-0"
    />
  );
};
