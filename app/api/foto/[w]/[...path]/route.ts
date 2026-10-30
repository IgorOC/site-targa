import { PHOTO_BASE } from "@/lib/photo"
import { servePhoto } from "@/lib/photo-render"

export const runtime = "nodejs"

// /api/foto/640/1817498/2_115421.jpg -> foto https://www.autocerto.com/fotos/3705/1817498/2_115421.jpg em 640 px.
// A foto vai no caminho (e não na query) para cada uma ter o seu cache na CDN.
export async function GET(_request: Request, ctx: RouteContext<"/api/foto/[w]/[...path]">) {
  const { w, path } = await ctx.params
  if (!path.every((part) => /^[\w.-]+$/.test(part))) return new Response("Foto não permitida", { status: 400 })
  return servePhoto(PHOTO_BASE + path.join("/"), Number(w) || 1080)
}
