import type { ImageLoaderProps } from "next/image"

const ALLOWED = "https://www.autocerto.com/fotos/3705/"

export function isAllowedPhoto(src: string) {
  return src.startsWith(ALLOWED) && !src.includes("..")
}

// Fotos remotas do estoque passam pela rota /api/foto (corta as faixas brancas);
// uploads do painel (/uploads/...) seguem pelo otimizador padrão do Next.
export function photoLoader({ src, width }: ImageLoaderProps) {
  return `/api/foto?src=${encodeURIComponent(src)}&w=${width}`
}

export function loaderFor(src: string) {
  return isAllowedPhoto(src) ? photoLoader : undefined
}
