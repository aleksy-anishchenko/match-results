export type Match = {
  idEvent: string
  strHomeTeam: string
  strAwayTeam: string
  strHomeTeamBadge: string
  strAwayTeamBadge: string
  intHomeScore: string | null
  intAwayScore: string | null
  strStatus: string
  intProgress: string | null
  strTimestamp: string
  dateEvent: string
  strGroup: string | null
  strSeason: string
}

export type MatchesResponse = {
  matches: Match[]
}
