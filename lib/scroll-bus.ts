type LenisLike = {
  scrollTo: (target: string | number | HTMLElement, options?: { offset?: number }) => void
}

export const scrollBus: { lenis: LenisLike | null } = { lenis: null }
