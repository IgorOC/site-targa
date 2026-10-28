import { promises as fs } from "fs"
import path from "path"
import { seed } from "./seed"
import type { Db } from "./types"

const file = path.join(process.cwd(), "data", "db.json")

let chain: Promise<void> = Promise.resolve()

async function load(): Promise<Db> {
  try {
    const raw = await fs.readFile(file, "utf8")
    return JSON.parse(raw) as Db
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code
    if (code !== "ENOENT") throw error
    await fs.mkdir(path.dirname(file), { recursive: true })
    const db = structuredClone(seed)
    await fs.writeFile(file, JSON.stringify(db, null, 2), "utf8")
    return db
  }
}

export async function getDb() {
  return load()
}

export function updateDb(mutator: (db: Db) => void) {
  const job = chain.then(async () => {
    const db = await load()
    mutator(db)
    if (db.events.length > 20000) db.events.splice(0, db.events.length - 20000)
    if (db.audit.length > 400) db.audit.splice(0, db.audit.length - 400)
    const tmp = `${file}.tmp`
    await fs.mkdir(path.dirname(file), { recursive: true })
    await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8")
    await fs.rename(tmp, file)
  })
  chain = job.then(
    () => undefined,
    () => undefined,
  )
  return job
}
