import { siFiat, siFord, siHonda, siJeep, siPorsche, siRenault, siToyota, siVolkswagen } from "simple-icons"

// Símbolos oficiais das marcas (pacote Simple Icons). Jaguar e Land Rover não estão no pacote:
// a Land Rover usa o oval com o nome, como no símbolo real; marcas sem símbolo mostram só o nome ao lado.
type MarkProps = { brand: string; className?: string }

const ICONS: Record<string, { path: string }> = {
  fiat: siFiat,
  ford: siFord,
  honda: siHonda,
  jeep: siJeep,
  porsche: siPorsche,
  renault: siRenault,
  toyota: siToyota,
  volkswagen: siVolkswagen,
}

export function BrandLogo({ brand, className = "h-6 w-6" }: MarkProps) {
  const key = brand.trim().toLowerCase()
  const icon = ICONS[key]
  if (icon) {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
        <path d={icon.path} />
      </svg>
    )
  }
  if (key === "land rover") {
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden>
        <ellipse cx="24" cy="24" rx="22.5" ry="12.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <text
          x="24"
          y="26.2"
          textAnchor="middle"
          fontSize="6.4"
          letterSpacing="0.4"
          fill="currentColor"
          fontFamily="var(--font-display), sans-serif"
          fontWeight={700}
        >
          LAND ROVER
        </text>
      </svg>
    )
  }
  return null
}
