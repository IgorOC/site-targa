type LenisLike = {
  scrollTo: (target: string | number | HTMLElement, options?: { offset?: number; immediate?: boolean }) => void
  stop: () => void
  start: () => void
}

export const scrollBus: { lenis: LenisLike | null } = { lenis: null }
