import Link from "next/link"

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-accent">404</p>
        <h1 className="mt-3 font-display text-5xl">Esse carro não está na vitrine.</h1>
        <Link href="/estoque" className="mt-6 inline-flex rounded-[22px] bg-accent px-5 py-3 text-sm font-medium text-obsidian">
          Ver o estoque
        </Link>
      </div>
    </div>
  )
}
