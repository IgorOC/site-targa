type MarkProps = { brand: string; className?: string }

const text = {
  fill: "currentColor",
  stroke: "none",
  fontFamily: "var(--font-display), sans-serif",
  fontWeight: 600,
} as const

function Mark({ brand }: { brand: string }) {
  switch (brand.trim().toLowerCase()) {
    case "toyota":
      return (
        <>
          <ellipse cx="24" cy="24" rx="13" ry="17.5" />
          <ellipse cx="17.5" cy="24" rx="8.5" ry="5.2" />
          <ellipse cx="30.5" cy="24" rx="8.5" ry="5.2" />
        </>
      )
    case "volkswagen":
      return (
        <>
          <circle cx="24" cy="24" r="16" />
          <text x="24" y="28.5" textAnchor="middle" fontSize="11" {...text}>VW</text>
        </>
      )
    case "honda":
      return (
        <>
          <rect x="8" y="10" width="32" height="28" rx="7" />
          <path d="M18 17v14M30 17v14M18 24h12" />
        </>
      )
    case "ford":
      return (
        <>
          <ellipse cx="24" cy="24" rx="18" ry="11" />
          <text x="24" y="28" textAnchor="middle" fontSize="11" fontStyle="italic" {...text}>Ford</text>
        </>
      )
    case "jeep":
      return (
        <>
          <rect x="5" y="14" width="38" height="20" rx="2" />
          {[0, 1, 2, 3, 4, 5].map((slot) => (
            <line key={slot} x1={11 + slot * 5.2} y1="17" x2={11 + slot * 5.2} y2="31" />
          ))}
        </>
      )
    case "fiat":
      return (
        <>
          <circle cx="24" cy="24" r="16" />
          <text x="24" y="28" textAnchor="middle" fontSize="9" {...text}>FIAT</text>
        </>
      )
    case "renault":
      return <path d="M24 6.5 42 24 24 41.5 6 24Z" />
    case "porsche":
      return (
        <>
          <path d="M24 6.5 37.5 12.5V25.5c0 7.4-6 12.8-13.5 16.2C16.5 38.3 10.5 32.9 10.5 25.5V12.5L24 6.5Z" />
          <text x="24" y="28" textAnchor="middle" fontSize="13" {...text}>P</text>
        </>
      )
    case "jaguar":
      return (
        <>
          <circle cx="24" cy="24" r="16" />
          <text x="24" y="29" textAnchor="middle" fontSize="14" {...text}>J</text>
        </>
      )
    case "land rover":
      return (
        <>
          <ellipse cx="24" cy="24" rx="18" ry="12" />
          <text x="24" y="27.5" textAnchor="middle" fontSize="8" {...text}>LR</text>
        </>
      )
    default:
      return (
        <>
          <circle cx="24" cy="24" r="16" />
          <text x="24" y="29" textAnchor="middle" fontSize="14" {...text}>
            {(brand.trim().charAt(0) || "?").toUpperCase()}
          </text>
        </>
      )
  }
}

export function BrandLogo({ brand, className = "h-6 w-6" }: MarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <Mark brand={brand} />
    </svg>
  )
}
