"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { deleteVehicle, duplicateVehicle, saveVehicle, uploadVehiclePhoto } from "@/lib/actions"
import { slugify, todayKey } from "@/lib/format"
import type { AuditEntry, Vehicle } from "@/lib/types"

const field = "mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"

export function VehicleForm({
  vehicle,
  showCosts,
  audits,
}: {
  vehicle: Vehicle | null
  showCosts: boolean
  audits: AuditEntry[]
}) {
  const router = useRouter()
  const [photos, setPhotos] = useState<string[]>(vehicle?.photos || [])
  const [spin, setSpin] = useState<string[]>(vehicle?.spinFrames || [])
  const [cover, setCover] = useState(vehicle?.coverIndex || 0)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const blank = !vehicle

  async function onUpload(list: FileList | null, target: "photos" | "spin") {
    if (!list) return
    setBusy(true)
    for (const file of list) {
      const data = new FormData()
      data.set("file", file)
      const response = await uploadVehiclePhoto(data)
      if (!response.ok) {
        setError(response.error)
        break
      }
      if (target === "photos") setPhotos((current) => [...current, response.url])
      else setSpin((current) => [...current, response.url])
    }
    setBusy(false)
  }

  function move(index: number, direction: -1 | 1) {
    setPhotos((current) => {
      const next = [...current]
      const target = index + direction
      if (target < 0 || target >= next.length) return current
      const [item] = next.splice(index, 1)
      next.splice(target, 0, item)
      if (cover === index) setCover(target)
      return next
    })
  }

  return (
    <form
      className="space-y-8"
      onSubmit={async (event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        data.set("photos", JSON.stringify(photos))
        data.set("spinFrames", JSON.stringify(spin))
        data.set("coverIndex", String(cover))
        const response = await saveVehicle(data)
        if (!response.ok) {
          setError(response.error)
          return
        }
        router.push(`/admin/veiculos/${response.id}`)
        router.refresh()
      }}
    >
      <input type="hidden" name="id" value={vehicle?.id || ""} />
      <section className="grid gap-4 rounded-2xl bg-white p-5 md:grid-cols-2">
        <h2 className="font-display text-2xl md:col-span-2">Anúncio</h2>
        <Field name="brand" label="Marca" defaultValue={vehicle?.brand} />
        <Field name="model" label="Modelo" defaultValue={vehicle?.model} />
        <label className="md:col-span-2 text-xs uppercase tracking-[0.12em] text-[#5c616a]">
          Versão
          <input name="version" defaultValue={vehicle?.version} className={field} />
        </label>
        <Field name="yearMake" label="Ano fabricação" type="number" defaultValue={String(vehicle?.yearMake || new Date().getFullYear())} />
        <Field name="yearModel" label="Ano modelo" type="number" defaultValue={String(vehicle?.yearModel || new Date().getFullYear())} />
        <Field name="km" label="Quilometragem" type="number" defaultValue={String(vehicle?.km || 0)} />
        <Field name="price" label="Preço" type="number" defaultValue={String(vehicle?.price || "")} />
        <Field name="promoPrice" label="Preço promocional" type="number" defaultValue={vehicle?.promoPrice ? String(vehicle.promoPrice) : ""} />
        <label className="text-xs uppercase tracking-[0.12em] text-[#5c616a]">
          Tipo
          <select name="bodyType" defaultValue={vehicle?.bodyType || "suv"} className={field}>
            <option value="suv">SUV</option>
            <option value="picape">Picape</option>
            <option value="sedan">Sedã</option>
            <option value="esportivo">Esportivo</option>
            <option value="hatch">Hatch</option>
          </select>
        </label>
        <label className="md:col-span-2 text-xs uppercase tracking-[0.12em] text-[#5c616a]">
          Endereço da página
          <input name="slug" defaultValue={vehicle?.slug} placeholder="porsche-911-2020" className={field} onBlur={(event) => { if (!event.target.value) return; event.target.value = slugify(event.target.value) }} />
        </label>
        <label className="md:col-span-2 text-xs uppercase tracking-[0.12em] text-[#5c616a]">
          Descrição
          <textarea name="description" defaultValue={vehicle?.description} className={`${field} min-h-32`} />
        </label>
      </section>

      <section className="grid gap-4 rounded-2xl bg-white p-5 md:grid-cols-3">
        <h2 className="font-display text-2xl md:col-span-3">Ficha</h2>
        <Field name="color" label="Cor" defaultValue={vehicle?.color} />
        <Field name="fuel" label="Combustível" defaultValue={vehicle?.fuel} />
        <Field name="transmission" label="Câmbio" defaultValue={vehicle?.transmission} />
        <Field name="doors" label="Portas" type="number" defaultValue={String(vehicle?.doors || 4)} />
        <Field name="engine" label="Motor" defaultValue={vehicle?.engine} />
        <Field name="power" label="Potência" defaultValue={vehicle?.power} />
        <Field name="plateEnd" label="Final da placa" defaultValue={vehicle?.plateEnd} />
        <Tri name="singleOwner" label="Único dono" value={vehicle?.singleOwner ?? null} />
        <Tri name="ipvaPaid" label="IPVA pago" value={vehicle?.ipvaPaid ?? null} />
        <Tri name="inspection" label="Laudo cautelar" value={vehicle?.inspection ?? null} />
        <Tri name="acceptsTrade" label="Aceita troca" value={vehicle?.acceptsTrade ?? null} />
        <label className="md:col-span-3 text-xs uppercase tracking-[0.12em] text-[#5c616a]">
          Opcionais, um por linha
          <textarea name="options" defaultValue={vehicle?.options.join("\n")} className={`${field} min-h-24`} />
        </label>
      </section>

      <section className="rounded-2xl bg-white p-5">
        <h2 className="font-display text-2xl">Fotos</h2>
        <p className="mt-1 text-sm text-[#5c616a]">A primeira marcada como capa aparece no card. O arquivo vira WebP ao subir.</p>
        <input type="file" accept="image/*" multiple className="mt-3 text-sm" onChange={(event) => onUpload(event.target.files, "photos")} />
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {photos.map((src, index) => (
            <li key={src} className="rounded-xl border border-black/10 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="aspect-[3/2] w-full rounded-lg object-cover" />
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <button type="button" onClick={() => setCover(index)} className={cover === index ? "text-[#8a6a32]" : ""}>{cover === index ? "Capa" : "Definir capa"}</button>
                <button type="button" onClick={() => move(index, -1)}>Subir</button>
                <button type="button" onClick={() => move(index, 1)}>Descer</button>
                <button type="button" onClick={() => setPhotos((current) => current.filter((item) => item !== src))}>Remover</button>
              </div>
            </li>
          ))}
        </ul>
        <h3 className="mt-6 font-display text-xl">Giro 360°</h3>
        <input type="file" accept="image/*" multiple className="mt-3 text-sm" onChange={(event) => onUpload(event.target.files, "spin")} />
        <p className="mt-2 text-xs text-[#5c616a]">{spin.length} fotos na sequência</p>
        <Field name="videoUrl" label="Link do vídeo" defaultValue={vehicle?.videoUrl} />
      </section>

      <section className="grid gap-4 rounded-2xl bg-white p-5 md:grid-cols-2">
        <h2 className="font-display text-2xl md:col-span-2">Publicação</h2>
        <label className="text-xs uppercase tracking-[0.12em] text-[#5c616a]">
          Status
          <select name="status" defaultValue={vehicle?.status || "disponivel"} className={field}>
            <option value="disponivel">Disponível</option>
            <option value="reservado">Reservado</option>
            <option value="vendido">Vendido</option>
            <option value="oculto">Oculto</option>
          </select>
        </label>
        <Field name="enteredAt" label="Entrada no estoque" type="date" defaultValue={vehicle?.enteredAt || todayKey()} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={vehicle?.featured} /> Destaque na home
        </label>
        <Field name="featuredOrder" label="Ordem do destaque" type="number" defaultValue={String(vehicle?.featuredOrder || 0)} />
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input type="checkbox" name="soldViaSite" defaultChecked={vehicle?.soldViaSite} /> Vendido via site
        </label>
        <Field name="seoTitle" label="Título de SEO" defaultValue={vehicle?.seoTitle} />
        <label className="text-xs uppercase tracking-[0.12em] text-[#5c616a]">
          Descrição de SEO
          <textarea name="seoDescription" defaultValue={vehicle?.seoDescription} className={`${field} min-h-20`} />
        </label>
      </section>

      {showCosts && (
        <section className="grid gap-4 rounded-2xl border border-[#d7263d]/30 bg-white p-5 md:grid-cols-2">
          <h2 className="font-display text-2xl md:col-span-2">Interno, só o dono</h2>
          <Field name="cost" label="Custo de aquisição" type="number" defaultValue={vehicle?.cost ? String(vehicle.cost) : ""} />
          <Field name="plate" label="Placa completa" defaultValue={vehicle?.plate || ""} />
        </section>
      )}

      {error && <p className="text-sm text-[#d7263d]">{error}</p>}
      <div className="flex flex-wrap gap-3">
        <button disabled={busy} className="rounded-xl bg-[#17181b] px-5 py-3 text-sm text-white">{busy ? "Enviando fotos..." : blank ? "Publicar anúncio" : "Salvar"}</button>
        {vehicle && (
          <>
            <button
              type="button"
              className="rounded-xl border border-black/10 px-5 py-3 text-sm"
              onClick={async () => {
                const response = await duplicateVehicle(vehicle.id)
                if (response.ok) router.push(`/admin/veiculos/${response.id}`)
              }}
            >
              Duplicar
            </button>
            <button
              type="button"
              className="rounded-xl border border-black/10 px-5 py-3 text-sm"
              onClick={async () => {
                if (!confirm("Ocultar este anúncio do site?")) return
                await deleteVehicle(vehicle.id, "ocultar")
                router.refresh()
              }}
            >
              Ocultar
            </button>
            <button
              type="button"
              className="rounded-xl border border-[#d7263d]/40 px-5 py-3 text-sm text-[#d7263d]"
              onClick={async () => {
                if (!confirm("Excluir de vez? O histórico de analytics deste endereço deixa de ter o carro.")) return
                const response = await deleteVehicle(vehicle.id, "excluir")
                if (!response.ok) {
                  setError(response.error)
                  return
                }
                router.push("/admin/veiculos")
              }}
            >
              Excluir
            </button>
          </>
        )}
      </div>
      {audits.length > 0 && (
        <section>
          <h2 className="font-display text-xl">Histórico</h2>
          <ul className="mt-2 space-y-1 text-sm text-[#5c616a]">
            {audits.slice(-8).reverse().map((entry) => (
              <li key={entry.id}>{new Date(entry.at).toLocaleString("pt-BR")} · {entry.user} · {entry.summary}</li>
            ))}
          </ul>
        </section>
      )}
    </form>
  )
}

function Field({ name, label, defaultValue = "", type = "text" }: { name: string; label: string; defaultValue?: string; type?: string }) {
  return (
    <label className="text-xs uppercase tracking-[0.12em] text-[#5c616a]">
      {label}
      <input name={name} type={type} defaultValue={defaultValue} className={field} />
    </label>
  )
}

function Tri({ name, label, value }: { name: string; label: string; value: boolean | null }) {
  return (
    <label className="text-xs uppercase tracking-[0.12em] text-[#5c616a]">
      {label}
      <select name={name} defaultValue={value === null ? "" : value ? "sim" : "nao"} className={field}>
        <option value="">Não informado</option>
        <option value="sim">Sim</option>
        <option value="nao">Não</option>
      </select>
    </label>
  )
}
