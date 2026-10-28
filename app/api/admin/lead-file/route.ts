import { promises as fs } from "fs"
import path from "path"
import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return new NextResponse("Não autorizado", { status: 401 })
  const name = new URL(request.url).searchParams.get("name") || ""
  if (!/^[a-z0-9-]+\.webp$/i.test(name)) return new NextResponse("Arquivo inválido", { status: 400 })
  const file = path.join(process.cwd(), "data", "private", name)
  try {
    const data = await fs.readFile(file)
    return new NextResponse(new Uint8Array(data), {
      headers: { "Content-Type": "image/webp", "Cache-Control": "private, max-age=3600" },
    })
  } catch {
    return new NextResponse("Não encontrado", { status: 404 })
  }
}
