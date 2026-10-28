import { BODY_LABEL } from "@/lib/format"
import type { BodyType } from "@/lib/types"

export function VehicleArt({ bodyType, brand }: { bodyType: BodyType; brand: string }) {
  return (
    <div className="relative grid h-full w-full place-items-center overflow-hidden bg-[radial-gradient(ellipse_at_center,rgba(255, 255, 255,0.18),rgba(11,11,13,0.2)_62%)]">
      <span className="absolute left-4 top-4 text-[11px] uppercase tracking-[0.22em] text-steel">{BODY_LABEL[bodyType]}</span>
      <span className="pointer-events-none absolute inset-x-4 top-1/2 -translate-y-1/2 text-center font-display text-5xl text-white/[0.05]">
        {brand}
      </span>
      <svg viewBox="0 0 420 180" className="relative w-[88%] text-porcelain" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
        {bodyType === "picape" && <Pickup />}
        {bodyType === "suv" && <Suv />}
        {bodyType === "esportivo" && <Sport />}
        {bodyType === "hatch" && <Hatch />}
        {bodyType === "sedan" && <Sedan />}
      </svg>
    </div>
  )
}

function Wheels({ x1, x2, y = 132 }: { x1: number; x2: number; y?: number }) {
  return (
    <>
      <circle cx={x1} cy={y} r="18" />
      <circle cx={x1} cy={y} r="7" stroke="#ffffff" />
      <circle cx={x2} cy={y} r="18" />
      <circle cx={x2} cy={y} r="7" stroke="#ffffff" />
    </>
  )
}

function Sport() {
  return (
    <>
      <path d="M28 126h46a18 18 0 1 1 36 0h78a18 18 0 1 1 36 0h148V108h-28c-14 0-24-16-48-24h-46V70h-62c-28 0-46 18-58 28H40c-10 0-16 10-12 28Z" />
      <path d="M168 78h62" stroke="#ffffff" />
      <path d="M250 96h46" />
      <Wheels x1={92} x2={270} />
    </>
  )
}

function Suv() {
  return (
    <>
      <path d="M36 128h34a20 20 0 1 1 40 0h150a20 20 0 1 1 40 0h62V96H318c-8-28-28-46-62-46H168c-30 0-48 16-62 34H52c-12 0-20 14-16 44Z" />
      <path d="M168 62h78" stroke="#ffffff" />
      <Wheels x1={90} x2={280} y={128} />
    </>
  )
}

function Pickup() {
  return (
    <>
      <path d="M24 124h40a18 18 0 1 1 36 0h70a18 18 0 1 1 36 0H250V86h-40c-18 0-30 12-42 26H48c-14 0-22 12-24 12Z" />
      <path d="M250 96h132v28H322" />
      <path d="M168 92h36" stroke="#ffffff" />
      <Wheels x1={82} x2={188} />
    </>
  )
}

function Sedan() {
  return (
    <>
      <path d="M30 124h42a18 18 0 1 1 36 0h150a18 18 0 1 1 36 0h62v-16H330c-10-22-34-40-70-40H176c-28 0-46 16-70 32H46c-12 0-18 10-16 24Z" />
      <path d="M186 80h64" stroke="#ffffff" />
      <Wheels x1={90} x2={276} />
    </>
  )
}

function Hatch() {
  return (
    <>
      <path d="M48 126h36a16 16 0 1 1 32 0h120a16 16 0 1 1 32 0h48v-18c-8-26-34-48-78-48H176c-36 0-54 20-70 40H62c-12 0-18 12-14 26Z" />
      <path d="M176 74h58" stroke="#ffffff" />
      <Wheels x1={102} x2={254} />
    </>
  )
}
