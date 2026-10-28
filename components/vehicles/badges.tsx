import type { Badge } from "@/lib/catalog"
import { cn } from "@/lib/format"

const tone = {
  gold: "border-accent/40 text-accent",
  porcelain: "border-white/20 text-porcelain",
  signal: "border-signal/50 text-signal",
}

export function Badges({ items }: { items: Badge[] }) {
  if (!items.length) return null
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item.id} className={cn("rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.14em]", tone[item.tone])}>
          {item.label}
        </li>
      ))}
    </ul>
  )
}
