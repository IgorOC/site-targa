"use client"

import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export function VisitsChart({ data }: { data: { date: string; count: number }[] }) {
  return (
    <div className="mt-3 h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={32} />
          <Tooltip />
          <Line type="monotone" dataKey="count" name="Visitas" stroke="#8a6a32" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function BarList({ data, label }: { data: { name: string; value: number }[]; label: string }) {
  if (!data.length) return <p className="mt-3 text-sm text-[#5c616a]">Sem dados neste período.</p>
  return (
    <div className="mt-3 h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
          <XAxis type="number" allowDecimals={false} />
          <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="value" name={label} fill="#17181b" radius={6} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
