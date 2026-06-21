type ApiMatch = {
  idEvent: string
  strHomeTeam: string
  strAwayTeam: string
  strHomeTeamBadge: string
  strAwayTeamBadge: string
  intHomeScore: string | null
  intAwayScore: string | null
  strStatus: string
  strTimestamp: string
  dateEvent: string
  strGroup: string | null
  strSeason: string
}

type ScheduleResponse = {
  schedule: ApiMatch[]
}

export default cachedEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const leagueId = String(query.leagueId ?? '4429')
  const today = new Date().toISOString().split('T')[0]
  const dateFrom = String(query.dateFrom ?? today)
  const dateTo = String(query.dateTo ?? today)

  const nextData = await $fetch<ScheduleResponse>(
    `https://www.thesportsdb.com/api/v2/json/schedule/next/league/${leagueId}`,
    { headers: { 'X-API-KEY': config.theSportsDbApiKey } }
  )

  const season = nextData.schedule[0]?.strSeason
  if (!season) return { matches: [] }

  const data = await $fetch<ScheduleResponse>(
    `https://www.thesportsdb.com/api/v2/json/schedule/league/${leagueId}/${season}`,
    { headers: { 'X-API-KEY': config.theSportsDbApiKey } }
  )

  const matches = data.schedule
    .filter(m => m.dateEvent >= dateFrom && m.dateEvent <= dateTo)
    .sort((a, b) => a.strTimestamp.localeCompare(b.strTimestamp))
    .map(({ idEvent, strHomeTeam, strAwayTeam, strHomeTeamBadge, strAwayTeamBadge,
            intHomeScore, intAwayScore, strStatus, strTimestamp, dateEvent, strGroup }) => ({
      idEvent, strHomeTeam, strAwayTeam, strHomeTeamBadge, strAwayTeamBadge,
      intHomeScore, intAwayScore, strStatus, strTimestamp, dateEvent, strGroup
    }))

  return { matches }
}, {
  maxAge: 60 * 5, // кэш 5 минут — матчи обновляются часто
  getKey: (event) => {
    const q = getQuery(event)
    return `matches-${q.leagueId}-${q.dateFrom}-${q.dateTo}`
  }
})
