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

type V1Response = {
  events: Array<{
    intHomeScoreExtra: string | null
    intAwayScoreExtra: string | null
  }> | null
}

const getMoscowDate = (timestamp: string) =>
  new Date(timestamp + 'Z').toLocaleDateString('sv-SE', { timeZone: 'Europe/Moscow' })

export default cachedEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const leagueId = String(query.leagueId ?? '4429')

  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Moscow' })
  const dateFrom = String(query.dateFrom ?? today)
  const dateTo = String(query.dateTo ?? today)

  const apiBase = 'https://www.thesportsdb.com/api/v2/json'
  const headers = { 'X-API-KEY': config.theSportsDbApiKey }

  const nextData = await $fetch<ScheduleResponse>(
    `${apiBase}/schedule/next/league/${leagueId}`,
    { headers },
  )

  const season = nextData.schedule[0]?.strSeason
  if (!season) return { matches: [] }

  const data = await $fetch<ScheduleResponse>(
    `${apiBase}/schedule/league/${leagueId}/${season}`,
    { headers },
  )

  const filtered = data.schedule
    .filter(m => {
      const moscowDate = getMoscowDate(m.strTimestamp)
      return moscowDate >= dateFrom && moscowDate <= dateTo
    })
    .sort((a, b) => a.strTimestamp.localeCompare(b.strTimestamp))

  // For AP (after penalties) matches, look up penalty scores from v1 API
  const v1Base = 'https://www.thesportsdb.com/api/v1/json'
  const apIds = filtered.filter(m => m.strStatus === 'AP').map(m => m.idEvent)
  const penScoreMap: Record<string, { home: number | null; away: number | null }> = {}

  if (apIds.length) {
    await Promise.all(apIds.map(async (id) => {
      const v1 = await $fetch<V1Response>(
        `${v1Base}/${config.theSportsDbApiKey}/lookupevent.php?id=${id}`,
      ).catch(() => null)
      const ev = v1?.events?.[0]
      penScoreMap[id] = {
        home: ev?.intHomeScoreExtra != null ? Number(ev.intHomeScoreExtra) : null,
        away: ev?.intAwayScoreExtra != null ? Number(ev.intAwayScoreExtra) : null,
      }
    }))
  }

  const matches = filtered.map(({
    idEvent, strHomeTeam, strAwayTeam, strHomeTeamBadge, strAwayTeamBadge,
    intHomeScore, intAwayScore, strStatus, strTimestamp, dateEvent, strGroup,
  }) => ({
    idEvent, strHomeTeam, strAwayTeam, strHomeTeamBadge, strAwayTeamBadge,
    intHomeScore, intAwayScore,
    intHomeScoreExtra: penScoreMap[idEvent]?.home ?? null,
    intAwayScoreExtra: penScoreMap[idEvent]?.away ?? null,
    strStatus, strTimestamp, dateEvent, strGroup,
  }))

  return { matches }
}, {
  maxAge: 60,
  getKey: (event) => {
    const q = getQuery(event)
    return `matches-${q.leagueId}-${q.dateFrom}-${q.dateTo}`
  },
})
