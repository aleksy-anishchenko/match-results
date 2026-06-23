type ScheduleResponse = {
  schedule: Array<{ strLeagueBadge: string | null }>
}

export default cachedEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const leagueId = String(query.leagueId ?? '4429')

  const data = await $fetch<ScheduleResponse>(
    `https://www.thesportsdb.com/api/v2/json/schedule/next/league/${leagueId}`,
    {headers: {'X-API-KEY': config.theSportsDbApiKey}}
  )

  return {badge: data.schedule[0]?.strLeagueBadge ?? null}
}, {
  maxAge: 86400,
  getKey: (event) => `league-badge-${getQuery(event).leagueId ?? '4429'}`
})
