import type { Competition } from '~/types'

export function useCompetition() {
  const selectedId = useCookie<string>('competition', {
    default: () => DEFAULT_COMPETITION_ID,
    maxAge: 60 * 60 * 24 * 365,
  })

  const competition = computed<Competition>(() =>
    getCompetition(selectedId.value) ?? COMPETITIONS[0]!,
  )

  return { selectedId, competition }
}
