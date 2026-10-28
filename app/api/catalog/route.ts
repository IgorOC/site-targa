import { NextResponse } from "next/server"
import { isPublic, toPublic } from "@/lib/catalog"
import { getDb } from "@/lib/store"

export const runtime = "nodejs"

export async function GET() {
  const db = await getDb()
  return NextResponse.json(db.vehicles.filter(isPublic).map(toPublic))
}
