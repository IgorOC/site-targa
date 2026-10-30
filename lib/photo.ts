import type { ImageLoaderProps } from "next/image"

export const PHOTO_BASE = "https://www.autocerto.com/fotos/3705/"

export function isAllowedPhoto(src: string) {
  return src.startsWith(PHOTO_BASE) && !src.includes("..")
}

// Caminho da foto remota na rota que corta as faixas brancas: /api/foto/<largura>/<resto do endereço>
export function photoPath(src: string, width: number) {
  return `/api/foto/${width}/${src.slice(PHOTO_BASE.length)}`
}

// Fotos remotas do estoque passam pela rota /api/foto (corta as faixas brancas);
// uploads do painel (/uploads/...) seguem pelo otimizador padrão do Next.
export function photoLoader({ src, width }: ImageLoaderProps) {
  return photoPath(src, width)
}

export function loaderFor(src: string) {
  return isAllowedPhoto(src) ? photoLoader : undefined
}
