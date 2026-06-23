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

  const apiBase = 'https://www.thesportsdb.com/api/v2/json'
  const headers = { 'X-API-KEY': config.theSportsDbApiKey }

  const nextData = await $fetch<ScheduleResponse>(
    `${apiBase}/schedule/next/league/${leagueId}`,
    { headers }
  )

  const season = nextData.schedule[0]?.strSeason
  if (!season) return { matches: [] }

  const data = await $fetch<ScheduleResponse>(
    `${apiBase}/schedule/league/${leagueId}/${season}`,
    { headers }
  )

  const getMoscowDate = (timestamp: string) =>
    new Date(timestamp + 'Z').toLocaleDateString('sv-SE', { timeZone: 'Europe/Moscow' })

  const matches = data.schedule
    .filter(m => {
      const moscowDate = getMoscowDate(m.strTimestamp)
      return moscowDate >= dateFrom && moscowDate <= dateTo
    })
    .sort((a, b) => a.strTimestamp.localeCompare(b.strTimestamp))
    .map(({ idEvent, strHomeTeam, strAwayTeam, strHomeTeamBadge, strAwayTeamBadge,
            intHomeScore, intAwayScore, strStatus, strTimestamp, dateEvent, strGroup }) => ({
      idEvent, strHomeTeam, strAwayTeam, strHomeTeamBadge, strAwayTeamBadge,
      intHomeScore, intAwayScore, strStatus, strTimestamp, dateEvent, strGroup
    }))

  return { matches }
}, {
  maxAge: 60,
  getKey: (event) => {
    const q = getQuery(event)
    return `matches-${q.leagueId}-${q.dateFrom}-${q.dateTo}`
  }
})
