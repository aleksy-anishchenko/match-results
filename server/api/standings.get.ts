import type {GroupStanding} from '~/types'

type ApiMatch = {
  strHomeTeam: string
  strAwayTeam: string
  strHomeTeamBadge: string
  strAwayTeamBadge: string
  intHomeScore: string | null
  intAwayScore: string | null
  strStatus: string
  intRound: string
  strSeason: string
}

type ScheduleResponse = {
  schedule: ApiMatch[]
}

const GROUP_ROUNDS = ['1', '2', '3']

function inferGroups(matches: ApiMatch[]): string[][] {
  const playedWith: Record<string, Set<string>> = {}

  for (const match of matches) {
    const {strHomeTeam: home, strAwayTeam: away} = match
    if (!playedWith[home]) playedWith[home] = new Set()
    if (!playedWith[away]) playedWith[away] = new Set()
    playedWith[home]!.add(away)
    playedWith[away]!.add(home)
  }

  const visited = new Set<string>()
  const groups: string[][] = []

  for (const team of Object.keys(playedWith).sort()) {
    if (visited.has(team)) continue
    const group = [team, ...(playedWith[team] ?? [])].sort()
    groups.push(group)
    group.forEach(t => visited.add(t))
  }

  return groups.sort((a, b) => (a[0] ?? '').localeCompare(b[0] ?? ''))
}

function calculateStandings(
  groupTeams: string[],
  badgeMap: Record<string, string>,
  finishedMatches: ApiMatch[],
): GroupStanding[] {
  const stats: Record<string, GroupStanding> = {}

  for (const team of groupTeams) {
    stats[team] = {
      team,
      badge: badgeMap[team] ?? '',
      played: 0, won: 0, drawn: 0, lost: 0,
      goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0,
    }
  }

  for (const match of finishedMatches) {
    const {
      strHomeTeam: home,
      strAwayTeam: away,
      intHomeScore,
      intAwayScore
    } = match
    if (!stats[home] || !stats[away]) continue

    const homeGoals = parseInt(intHomeScore ?? '0')
    const awayGoals = parseInt(intAwayScore ?? '0')

    stats[home].played++
    stats[home].goalsFor += homeGoals
    stats[home].goalsAgainst += awayGoals

    stats[away].played++
    stats[away].goalsFor += awayGoals
    stats[away].goalsAgainst += homeGoals

    if (homeGoals > awayGoals) {
      stats[home].won++;
      stats[home].points += 3
      stats[away].lost++
    } else if (homeGoals === awayGoals) {
      stats[home].drawn++;
      stats[home].points++
      stats[away].drawn++;
      stats[away].points++
    } else {
      stats[away].won++;
      stats[away].points += 3
      stats[home].lost++
    }
  }

  return Object.values(stats)
    .map(s => ({...s, goalDiff: s.goalsFor - s.goalsAgainst}))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff
      return b.goalsFor - a.goalsFor
    })
}

export default cachedEventHandler(async () => {
  const config = useRuntimeConfig()
  const headers = {'X-API-KEY': config.theSportsDbApiKey}
  const apiBase = 'https://www.thesportsdb.com/api/v2/json'

  const nextData = await $fetch<ScheduleResponse>(
    `${apiBase}/schedule/next/league/4429`,
    {headers},
  )

  const season = nextData.schedule[0]?.strSeason
  if (!season) return {groups: {}}

  const data = await $fetch<ScheduleResponse>(
    `${apiBase}/schedule/league/4429/${season}`,
    {headers},
  )

  const groupMatches = data.schedule.filter(m => GROUP_ROUNDS.includes(m.intRound))

  const badgeMap: Record<string, string> = {}
  for (const match of groupMatches) {
    badgeMap[match.strHomeTeam] = match.strHomeTeamBadge
    badgeMap[match.strAwayTeam] = match.strAwayTeamBadge
  }

  const groups = inferGroups(groupMatches)
  const finishedMatches = groupMatches.filter(m => m.strStatus === 'FT')

  const result: Record<string, GroupStanding[]> = {}
  groups.forEach((groupTeams, index) => {
    const letter = String.fromCharCode(65 + index)
    result[letter] = calculateStandings(groupTeams, badgeMap, finishedMatches)
  })

  return {groups: result}
}, {
  maxAge: 60,
  getKey: () => 'standings-4429',
})
