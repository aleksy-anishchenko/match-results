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

export type GroupStanding = {
  team: string
  badge: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDiff: number
  points: number
}

export type StandingsResponse = {
  groups: Record<string, GroupStanding[]>
}
