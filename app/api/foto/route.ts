import { servePhoto } from "@/lib/photo-render"

export const runtime = "nodejs"

// Endereço antigo (?src=...&w=...), mantido para links já indexados. O site usa /api/foto/<largura>/<foto>,
// porque a CDN do Netlify não separa o cache pela query e entregava a mesma foto para todos os carros.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  return servePhoto(searchParams.get("src") || "", Number(searchParams.get("w")) || 1080)
}
