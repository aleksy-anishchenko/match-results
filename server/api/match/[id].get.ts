import type { MatchDetails } from '~/types'

type ApiEvent = {
  idEvent: string
  strHomeTeam: string
  strAwayTeam: string
  strHomeTeamBadge: string
  strAwayTeamBadge: string
  intHomeScore: string | null
  intAwayScore: string | null
  intHomeScoreExtra: string | null
  intAwayScoreExtra: string | null
  strStatus: string
  strTimestamp: string
  dateEvent: string
  strTime: string
  strLeague: string
  strSeason: string
  intRound: string | null
  strVenue: string | null
  strCity: string | null
  strCountry: string | null
}

type V1Response = {
  events: ApiEvent[] | null
}

export default cachedEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const base = `https://www.thesportsdb.com/api/v1/json/${config.theSportsDbApiKey}`

  const data = await $fetch<V1Response>(`${base}/lookupevent.php?id=${id}`).catch(() => null)
  const ev = data?.events?.[0]
  if (!ev) {
    throw createError({ statusCode: 404, statusMessage: 'Матч не найден' })
  }

  const details: MatchDetails = {
    idEvent: ev.idEvent,
    homeTeam: ev.strHomeTeam,
    awayTeam: ev.strAwayTeam,
    homeBadge: ev.strHomeTeamBadge,
    awayBadge: ev.strAwayTeamBadge,
    homeScore: ev.intHomeScore,
    awayScore: ev.intAwayScore,
    homePenScore: ev.intHomeScoreExtra != null ? Number(ev.intHomeScoreExtra) : null,
    awayPenScore: ev.intAwayScoreExtra != null ? Number(ev.intAwayScoreExtra) : null,
    status: ev.strStatus,
    timestamp: ev.strTimestamp,
    date: ev.dateEvent,
    time: ev.strTime,
    league: ev.strLeague,
    season: ev.strSeason,
    round: ev.intRound,
    venue: ev.strVenue,
    city: ev.strCity,
    country: ev.strCountry,
  }

  return details
}, {
  maxAge: 60,
  getKey: event => `match-${getRouterParam(event, 'id')}`,
})
