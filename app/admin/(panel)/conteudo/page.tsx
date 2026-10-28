import { redirect } from "next/navigation"
import { ContentEditor } from "@/components/admin/content-editor"
import { canEditContent, getSession } from "@/lib/auth"
import { getDb } from "@/lib/store"

export default async function ContentPage() {
  const session = await getSession()
  if (!session || !canEditContent(session.role)) redirect("/admin")
  const db = await getDb()
  return (
    <div>
      <h1 className="mb-6 font-display text-4xl">Conteúdo do site</h1>
      <ContentEditor content={db.content} />
    </div>
  )
}
