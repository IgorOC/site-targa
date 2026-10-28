import { createHash } from "crypto"
import { promises as fs } from "fs"
import path from "path"
import sharp from "sharp"
import { isAllowedPhoto } from "@/lib/photo"

export const runtime = "nodejs"

const WIDTHS = [256, 384, 640, 828, 1080, 1200, 1600, 1920, 2048]
const cacheDir = path.join(process.cwd(), ".next", "cache", "targa-fotos")

// As fotos atuais do estoque são verticais, com faixas brancas dos lados.
// Esta rota corta as faixas, redimensiona e entrega em WebP, com cache em disco.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const src = searchParams.get("src") || ""
  const asked = Number(searchParams.get("w")) || 1080
  if (!isAllowedPhoto(src)) return new Response("Foto não permitida", { status: 400 })
  const width = WIDTHS.find((w) => w >= asked) ?? WIDTHS[WIDTHS.length - 1]

  const key = createHash("sha1").update(`${src}|${width}`).digest("hex")
  const file = path.join(cacheDir, `${key}.webp`)
  const headers = { "Content-Type": "image/webp", "Cache-Control": "public, max-age=2592000, immutable" }

  try {
    return new Response(new Uint8Array(await fs.readFile(file)), { headers })
  } catch {
    // ainda não está no cache
  }

  const upstream = await fetch(src, { cache: "no-store" })
  if (!upstream.ok) return new Response("Foto indisponível", { status: 502 })
  const input = Buffer.from(await upstream.arrayBuffer())

  let trimmed: Buffer
  try {
    trimmed = await sharp(input).trim({ background: "#ffffff", threshold: 18 }).toBuffer()
  } catch {
    trimmed = input
  }
  const output = await sharp(trimmed)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer()

  await fs.mkdir(cacheDir, { recursive: true })
  await fs.writeFile(file, output).catch(() => undefined)
  return new Response(new Uint8Array(output), { headers })
}
