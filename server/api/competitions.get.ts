import type { CompetitionWithBadge } from '~/types'

type LeagueInfo = {
  leagues: Array<{ strBadge: string | null }>
}

export default cachedEventHandler(async () => {
  const config = useRuntimeConfig()
  const base = `https://www.thesportsdb.com/api/v1/json/${config.theSportsDbApiKey}`

  const competitions: CompetitionWithBadge[] = await Promise.all(
    COMPETITIONS.map(async (competition) => {
      const badge = await $fetch<LeagueInfo>(`${base}/lookupleague.php?id=${competition.id}`)
        .then(data => data.leagues?.[0]?.strBadge ?? null)
        .catch(() => null)
      return { ...competition, badge }
    }),
  )

  return { competitions }
}, {
  maxAge: 86400,
  getKey: () => 'competitions',
})
