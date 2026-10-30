"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { VehicleCard } from "@/components/vehicles/vehicle-card"
import { BODY_LABEL } from "@/lib/format"
import { brandCounts, EMPTY_FILTERS, filtersFromParams, filterVehicles, modelCounts, sortVehicles, type FilterState } from "@/lib/catalog"
import { track } from "@/lib/track"
import type { BodyType, PublicVehicle } from "@/lib/types"

// A página do estoque é gerada com antecedência. No build ela sai com todos os carros (fallback do Suspense);
// no navegador, ExplorerFromUrl lê os filtros da URL (?marca=, ?tipo=...) e monta a lista já filtrada.
export function ExplorerFromUrl({ vehicles }: { vehicles: PublicVehicle[] }) {
  const params = useSearchParams()
  return <Explorer vehicles={vehicles} initial={filtersFromParams(new URLSearchParams(params.toString()))} />
}

export function Explorer({ vehicles, initial = EMPTY_FILTERS }: { vehicles: PublicVehicle[]; initial?: FilterState }) {
  const router = useRouter()
  const [filters, setFilters] = useState<FilterState>(initial)
  const [openFilters, setOpenFilters] = useState(false)
  const brands = brandCounts(vehicles)
  const models = modelCounts(vehicles, filters.marca || undefined)
  const years = [...new Set(vehicles.flatMap((vehicle) => [vehicle.yearModel, vehicle.yearMake]))].sort((a, b) => b - a)
  const maxPrice = Math.max(500000, ...vehicles.map((vehicle) => vehicle.price))
  const result = useMemo(() => sortVehicles(filterVehicles(vehicles, filters), filters.ordem), [vehicles, filters])

  function update(partial: Partial<FilterState>) {
    const next = { ...filters, ...partial }
    if (partial.marca !== undefined && partial.modelo === undefined) next.modelo = ""
    setFilters(next)
    const params = new URLSearchParams()
    ;(Object.keys(next) as (keyof FilterState)[]).forEach((key) => {
      if (next[key] && !(key === "ordem" && next[key] === "marca")) params.set(key, next[key])
    })
    const query = params.toString()
    router.replace(query ? `/estoque?${query}` : "/estoque", { scroll: false })
    if (next.q) track({ type: "search", meta: { q: next.q, results: filterVehicles(vehicles, next).length } })
  }

  return (
    <div className="mx-auto grid max-w-[1280px] gap-8 px-5 pb-36 lg:grid-cols-[280px_1fr]">
      <div>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-[22px] border border-white/15 px-4 py-3 text-sm lg:hidden"
          aria-expanded={openFilters}
          onClick={() => setOpenFilters((value) => !value)}
        >
          Filtros
          <span className="text-steel">{openFilters ? "Fechar" : "Abrir"}</span>
        </button>
        <aside className={`${openFilters ? "mt-4 block" : "hidden lg:block"} h-fit rounded-[24px] border border-white/10 bg-graphite p-5 lg:sticky lg:top-28 lg:mt-0`}>
        <h2 className="font-display text-2xl">Filtros</h2>
        <label className="mt-4 block text-xs uppercase tracking-[0.14em] text-steel">
          Busca
          <input value={filters.q} onChange={(event) => update({ q: event.target.value })} className="mt-2 w-full rounded-[16px] border border-white/10 bg-obsidian px-3 py-2 text-sm text-porcelain" />
        </label>
        <label className="mt-4 block text-xs uppercase tracking-[0.14em] text-steel">
          Marca
          <select value={filters.marca} onChange={(event) => update({ marca: event.target.value })} className="mt-2 w-full rounded-[16px] border border-white/10 bg-obsidian px-3 py-2 text-sm">
            <option value="">Todas</option>
            {brands.map(([brand, count]) => <option key={brand} value={brand}>{brand} ({count})</option>)}
          </select>
        </label>
        <label className="mt-4 block text-xs uppercase tracking-[0.14em] text-steel">
          Modelo
          <select value={filters.modelo} onChange={(event) => update({ modelo: event.target.value })} className="mt-2 w-full rounded-[16px] border border-white/10 bg-obsidian px-3 py-2 text-sm">
            <option value="">Todos</option>
            {models.map(([model, count]) => <option key={model} value={model}>{model} ({count})</option>)}
          </select>
        </label>
        <label className="mt-4 block text-xs uppercase tracking-[0.14em] text-steel">
          Ano
          <select value={filters.ano} onChange={(event) => update({ ano: event.target.value })} className="mt-2 w-full rounded-[16px] border border-white/10 bg-obsidian px-3 py-2 text-sm">
            <option value="">Todos</option>
            {years.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
        </label>
        <p className="mt-4 text-xs uppercase tracking-[0.14em] text-steel">Tipo</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(["", "suv", "picape", "sedan", "esportivo", "hatch"] as const).map((type) => (
            <button
              key={type || "todos"}
              className={`rounded-full border px-3 py-1 text-xs ${filters.tipo === type ? "border-accent text-accent" : "border-white/15 text-steel"}`}
              onClick={() => update({ tipo: type as "" | BodyType })}
            >
              {type ? BODY_LABEL[type] : "Todos"}
            </button>
          ))}
        </div>
        <label className="mt-4 block text-xs uppercase tracking-[0.14em] text-steel">
          Preço mínimo
          <input type="range" min={0} max={maxPrice} step={5000} value={Number(filters.precoMin) || 0} onChange={(event) => update({ precoMin: event.target.value === "0" ? "" : event.target.value })} className="mt-3 w-full accent-accent" />
        </label>
        <label className="mt-3 block text-xs uppercase tracking-[0.14em] text-steel">
          Preço máximo
          <input type="range" min={0} max={maxPrice} step={5000} value={Number(filters.precoMax) || maxPrice} onChange={(event) => update({ precoMax: Number(event.target.value) >= maxPrice ? "" : event.target.value })} className="mt-3 w-full accent-accent" />
        </label>
        <p className="mt-2 text-sm text-porcelain">
          {filters.precoMin ? Number(filters.precoMin).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "Sem mínimo"}
          {" — "}
          {filters.precoMax ? Number(filters.precoMax).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "Sem teto"}
        </p>
        <label className="mt-4 block text-xs uppercase tracking-[0.14em] text-steel">
          Km máxima
          <input value={filters.kmMax} onChange={(event) => update({ kmMax: event.target.value.replace(/\D/g, "") })} inputMode="numeric" className="mt-2 w-full rounded-[16px] border border-white/10 bg-obsidian px-3 py-2 text-sm" />
        </label>
        <button className="mt-5 text-sm text-accent" onClick={() => { setFilters(EMPTY_FILTERS); router.replace("/estoque", { scroll: false }) }}>
          Limpar filtros
        </button>
        </aside>
      </div>
      <div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-steel">{result.length} {result.length === 1 ? "veículo encontrado" : "veículos encontrados"}.</p>
          <label className="flex flex-wrap items-center gap-2 text-sm text-steel">
            Ordenar
            <select value={filters.ordem} onChange={(event) => update({ ordem: event.target.value })} className="max-w-full rounded-[16px] border border-white/10 bg-obsidian px-3 py-2 text-porcelain">
              <option value="marca">Marca/Modelo</option>
              <option value="preco-asc">Preço (crescente)</option>
              <option value="preco-desc">Preço (decrescente)</option>
              <option value="ano">Ano</option>
              <option value="km">Menor km</option>
            </select>
          </label>
        </div>
        <h2 className="sr-only">Veículos</h2>
        {result.length === 0 ? (
          <p className="rounded-[24px] border border-white/10 p-8 text-steel">Nenhum veículo com esses filtros. Limpe a busca ou fale no WhatsApp que a loja procura para você.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2" style={{ perspective: "1200px" }}>
            {result.map((vehicle, index) => <VehicleCard key={vehicle.slug} vehicle={vehicle} priority={index < 2} />)}
          </div>
        )}
      </div>
    </div>
  )
}
