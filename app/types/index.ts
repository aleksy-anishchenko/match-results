export type Match = {
  idEvent: string
  homeTeam: string
  awayTeam: string
  homeBadge: string
  awayBadge: string
  homeScore: string | null
  awayScore: string | null
  homePenScore: number | null
  awayPenScore: number | null
  status: string
  progress: string | null
  timestamp: string
  date: string
  group: string | null
  season: string
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

export type BracketMatch = {
  idEvent: string
  homeTeam: string
  awayTeam: string
  homeBadge: string
  awayBadge: string
  homeScore: string | null
  awayScore: string | null
  homePenScore: number | null
  awayPenScore: number | null
  status: string
  timestamp: string
}

export type BracketRound = {
  round: string
  name: string
  matches: BracketMatch[]
  projected?: boolean
}

export type BracketResponse = {
  rounds: BracketRound[]
}
