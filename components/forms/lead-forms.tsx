"use client"

import { useState } from "react"
import { submitContact, submitFinance, submitSell } from "@/lib/actions"
import { track } from "@/lib/track"

const field = "w-full rounded-[16px] border border-white/10 bg-obsidian px-3 py-3 text-sm"

export function ContactForm() {
  const [message, setMessage] = useState("")
  return (
    <form
      className="space-y-3"
      onSubmit={async (event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        data.set("sid", sessionStorage.getItem("targa-sid") || "")
        const response = await submitContact(data)
        setMessage(response.ok ? "Mensagem recebida. A Targa responde no horário de atendimento." : response.error || "Não foi possível enviar.")
        if (response.ok) event.currentTarget.reset()
      }}
    >
      <input name="company" className="hp" tabIndex={-1} autoComplete="off" aria-label="Não preencha este campo" />
      <input name="name" required placeholder="Nome" className={field} />
      <input name="phone" required placeholder="Telefone" className={field} />
      <input name="email" type="email" placeholder="E-mail" className={field} />
      <textarea name="message" required placeholder="Mensagem" className={`${field} min-h-32`} />
      <Consent />
      <button className="rounded-[22px] bg-accent px-5 py-3 text-sm font-medium text-obsidian">Enviar</button>
      {message && <p className="text-sm">{message}</p>}
    </form>
  )
}

export function FinanceForm({ vehicleLabel, vehicleSlug, refCode }: { vehicleLabel: string; vehicleSlug: string; refCode: string }) {
  const [step, setStep] = useState(0)
  const [message, setMessage] = useState("")
  const titles = ["Seus dados", "Renda e entrada", "O carro"]
  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault()
        if (step < 2) {
          setStep((value) => value + 1)
          return
        }
        const data = new FormData(event.currentTarget)
        data.set("sid", sessionStorage.getItem("targa-sid") || "")
        const response = await submitFinance(data)
        setMessage(response.ok ? "Ficha recebida. A loja retorna com as condições reais, sem parcela estimada no site." : response.error || "Não foi possível enviar.")
      }}
    >
      <div className="h-1 overflow-hidden rounded-full bg-white/10">
        <div className="h-full bg-accent" style={{ width: `${((step + 1) / 3) * 100}%` }} />
      </div>
      <p className="text-xs uppercase tracking-[0.16em] text-steel">Passo {step + 1} de 3 · {titles[step]}</p>
      <input name="company" className="hp" tabIndex={-1} autoComplete="off" aria-label="Não preencha este campo" />
      <input type="hidden" name="vehicleSlug" value={vehicleSlug} />
      <input type="hidden" name="vehicleLabel" value={vehicleLabel} />
      <input type="hidden" name="refCode" value={refCode} />
      <div className={step === 0 ? "space-y-3" : "hidden"}>
        <input name="name" required={step === 0} placeholder="Nome" className={field} />
        <input name="phone" required={step === 0} placeholder="Telefone" className={field} />
        <input name="email" type="email" placeholder="E-mail" className={field} />
        <input name="cpf" inputMode="numeric" placeholder="CPF (opcional)" className={field} />
      </div>
      <div className={step === 1 ? "space-y-3" : "hidden"}>
        <input name="job" placeholder="Profissão" className={field} />
        <input name="income" placeholder="Renda mensal" className={field} />
        <input name="down" placeholder="Entrada pretendida" className={field} />
      </div>
      <div className={step === 2 ? "space-y-3" : "hidden"}>
        <p className="text-sm text-steel">{vehicleLabel || "Sem veículo escolhido. A loja pode sugerir um do estoque."}</p>
        <textarea name="notes" placeholder="Observações" className={`${field} min-h-28`} />
        <Consent finance required={step === 2} />
      </div>
      <div className="flex gap-3">
        {step > 0 && <button type="button" className="rounded-[22px] border border-white/15 px-5 py-3 text-sm" onClick={() => setStep((value) => value - 1)}>Voltar</button>}
        <button className="rounded-[22px] bg-accent px-5 py-3 text-sm font-medium text-obsidian">{step < 2 ? "Continuar" : "Enviar ficha"}</button>
      </div>
      {message && <p className="text-sm">{message}</p>}
    </form>
  )
}

export function SellForm() {
  const [step, setStep] = useState(0)
  const [message, setMessage] = useState("")
  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault()
        if (step < 2) {
          setStep((value) => value + 1)
          return
        }
        const data = new FormData(event.currentTarget)
        data.set("sid", sessionStorage.getItem("targa-sid") || "")
        const response = await submitSell(data)
        setMessage(response.ok ? "Recebemos os dados do seu veículo. A avaliação segue com a equipe da loja." : response.error || "Não foi possível enviar.")
        if (response.ok) track({ type: "sell_submit", explicit: true })
      }}
    >
      <div className="h-1 overflow-hidden rounded-full bg-white/10">
        <div className="h-full bg-accent" style={{ width: `${((step + 1) / 3) * 100}%` }} />
      </div>
      <p className="text-xs uppercase tracking-[0.16em] text-steel">Passo {step + 1} de 3</p>
      <input name="company" className="hp" tabIndex={-1} autoComplete="off" aria-label="Não preencha este campo" />
      <div className={step === 0 ? "space-y-3" : "hidden"}>
        <input name="name" required={step === 0} placeholder="Seu nome" className={field} />
        <input name="phone" required={step === 0} placeholder="Telefone" className={field} />
        <input name="email" type="email" placeholder="E-mail" className={field} />
        <input name="city" placeholder="Cidade" className={field} />
      </div>
      <div className={step === 1 ? "space-y-3" : "hidden"}>
        <input name="brand" required={step === 1} placeholder="Marca" className={field} />
        <input name="model" required={step === 1} placeholder="Modelo" className={field} />
        <input name="year" placeholder="Ano" className={field} />
        <input name="km" placeholder="Quilometragem" className={field} />
        <input name="ask" placeholder="Valor pedido" className={field} />
        <textarea name="notes" placeholder="Estado, opcionais, observações" className={`${field} min-h-28`} />
      </div>
      <div className={step === 2 ? "space-y-3" : "hidden"}>
        <label className="block text-sm text-steel">
          Fotos do veículo
          <input name="photos" type="file" accept="image/*" multiple className="mt-2 block text-sm" />
        </label>
        <Consent required={step === 2} />
      </div>
      <div className="flex gap-3">
        {step > 0 && <button type="button" className="rounded-[22px] border border-white/15 px-5 py-3 text-sm" onClick={() => setStep((value) => value - 1)}>Voltar</button>}
        <button className="rounded-[22px] bg-accent px-5 py-3 text-sm font-medium text-obsidian">{step < 2 ? "Continuar" : "Enviar para avaliação"}</button>
      </div>
      {message && <p className="text-sm">{message}</p>}
    </form>
  )
}

function Consent({ finance = false, required = true }: { finance?: boolean; required?: boolean }) {
  return (
    <label className="flex gap-2 text-xs leading-5 text-steel">
      <input type="checkbox" name="consent" required={required} className="mt-1" />
      {finance
        ? "Autorizo a Targa a usar nome, contato, CPF e renda só para analisar esta ficha, conforme a política de privacidade."
        : "Autorizo a Targa a usar estes dados para responder este contato, conforme a política de privacidade."}
    </label>
  )
}
