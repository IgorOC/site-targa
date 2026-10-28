import { brl, cn } from "@/lib/format"

export function Price({ value, className }: { value: number; className?: string; glow?: boolean }) {
  return <span className={cn("tabular", className)}>{brl(value)}</span>
}
