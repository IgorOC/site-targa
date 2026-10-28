"use client"

import Image from "next/image"
import { useState } from "react"
import { login } from "@/lib/actions"

export default function LoginPage() {
  const [error, setError] = useState("")
  return (
    <div className="grid min-h-screen place-items-center bg-obsidian px-6">
      <form
        className="glass w-full max-w-md rounded-[28px] p-8"
        onSubmit={async (event) => {
          event.preventDefault()
          const response = await login(new FormData(event.currentTarget))
          if (response?.error) setError(response.error)
        }}
      >
        <Image src="/brand/logo.png" alt="Targa Motors" width={150} height={40} />
        <h1 className="mt-6 font-display text-3xl">Painel da loja</h1>
        <p className="mt-2 text-sm text-steel">Estoque, conteúdo, leads e o que o site está vendendo.</p>
        <label className="mt-6 block text-xs uppercase tracking-[0.14em] text-steel">
          E-mail
          <input name="email" type="email" required className="mt-2 w-full rounded-[16px] border border-white/10 bg-obsidian px-3 py-3 text-sm" />
        </label>
        <label className="mt-4 block text-xs uppercase tracking-[0.14em] text-steel">
          Senha
          <input name="password" type="password" required className="mt-2 w-full rounded-[16px] border border-white/10 bg-obsidian px-3 py-3 text-sm" />
        </label>
        {error && <p className="mt-3 text-sm text-signal">{error}</p>}
        <button className="mt-6 w-full rounded-[22px] bg-accent py-3 text-sm font-medium text-obsidian">Entrar</button>
      </form>
    </div>
  )
}
