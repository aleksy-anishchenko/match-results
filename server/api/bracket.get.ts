import type { BracketRound, BracketMatch } from '~/types'

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
  intRound: string
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

const GROUP_ROUNDS = new Set(['1', '2', '3'])
const FINISHED = new Set(['FT', 'AET', 'AP'])

// FIFA 2026 official bracket display order for Round of 32 (intRound = '32')
// Maps from timestamp-sorted index to bracket seeding position so that
// sequential pairing produces correct Round of 16 matchups:
//   [0,1] → R16#1, [2,3] → R16#2, [4,5] → R16#3, [6,7] → R16#4
//   [8,9] → R16#5, [10,11] → R16#6, [12,13] → R16#7, [14,15] → R16#8
const FIFA2026_R32_ORDER = [0, 3, 2, 5, 8, 9, 10, 11, 1, 4, 6, 7, 12, 15, 13, 14]

function getRoundName(count: number, isLast: boolean, isSecondToLast: boolean): string {
  if (count === 1 && isLast) return 'Финал'
  if (count === 1 && isSecondToLast) return 'Матч за 3-е место'
  if (count === 2) return 'Полуфинал'
  if (count === 4) return 'Четвертьфинал'
  if (count === 8) return '1/8 финала'
  if (count === 16) return '1/16 финала'
  return 'Раунд'
}

function matchWinner(m: BracketMatch): { team: string; badge: string } | null {
  if (!FINISHED.has(m.status)) return null
  const h = Number(m.homeScore ?? 0)
  const a = Number(m.awayScore ?? 0)
  if (h > a) return { team: m.homeTeam, badge: m.homeBadge }
  if (a > h) return { team: m.awayTeam, badge: m.awayBadge }
  // AP: use penalty scores to determine winner
  if (m.status === 'AP') {
    const hp = m.homePenScore ?? 0
    const ap = m.awayPenScore ?? 0
    if (hp > ap) return { team: m.homeTeam, badge: m.homeBadge }
    if (ap > hp) return { team: m.awayTeam, badge: m.awayBadge }
  }
  return null
}

function buildProjectedRounds(seed: BracketRound): BracketRound[] {
  const result: BracketRound[] = []
  let prev = seed.matches

  while (prev.length > 1) {
    const next: BracketMatch[] = []
    for (let i = 0; i < prev.length; i += 2) {
      const m1 = prev[i]!
      const m2 = prev[i + 1]
      const w1 = matchWinner(m1)
      const w2 = m2 ? matchWinner(m2) : null
      next.push({
        idEvent: `proj-${result.length}-${i}`,
        homeTeam: w1?.team ?? '',
        awayTeam: w2?.team ?? '',
        homeBadge: w1?.badge ?? '',
        awayBadge: w2?.badge ?? '',
        homeScore: null,
        awayScore: null,
        homePenScore: null,
        awayPenScore: null,
        status: 'NS',
        timestamp: '',
      })
    }
    result.push({ round: `proj-${result.length + 1}`, name: '', matches: next, projected: true })
    prev = next
    if (next.length === 1) break
  }

  // assign names now that we know the full projected structure
  const total = result.length
  result.forEach((r, idx) => {
    r.name = getRoundName(r.matches.length, idx === total - 1, idx === total - 2)
  })

  return result
}

export default cachedEventHandler(async () => {
  const config = useRuntimeConfig()
  const headers = { 'X-API-KEY': config.theSportsDbApiKey }
  const apiBase = 'https://www.thesportsdb.com/api/v2/json'
  const v1Base = 'https://www.thesportsdb.com/api/v1/json'

  const nextData = await $fetch<ScheduleResponse>(
    `${apiBase}/schedule/next/league/4429`,
    { headers },
  )

  const season = nextData.schedule[0]?.strSeason
  if (!season) return { rounds: [] }

  const data = await $fetch<ScheduleResponse>(
    `${apiBase}/schedule/league/4429/${season}`,
    { headers },
  )

  const playoffMatches = data.schedule.filter(m => !GROUP_ROUNDS.has(m.intRound))
  if (!playoffMatches.length) return { rounds: [] }

  // Fetch penalty scores for AP matches from v1 API
  const apMatches = playoffMatches.filter(m => m.strStatus === 'AP')
  const penScoreMap: Record<string, { home: number | null; away: number | null }> = {}
  if (apMatches.length) {
    await Promise.all(apMatches.map(async (m) => {
      const v1 = await $fetch<V1Response>(
        `${v1Base}/${config.theSportsDbApiKey}/lookupevent.php?id=${m.idEvent}`,
      ).catch(() => null)
      const ev = v1?.events?.[0]
      penScoreMap[m.idEvent] = {
        home: ev?.intHomeScoreExtra != null ? Number(ev.intHomeScoreExtra) : null,
        away: ev?.intAwayScoreExtra != null ? Number(ev.intAwayScoreExtra) : null,
      }
    }))
  }

  const byRound: Record<string, ApiMatch[]> = {}
  for (const match of playoffMatches) {
    if (!byRound[match.intRound]) byRound[match.intRound] = []
    byRound[match.intRound]!.push(match)
  }

  const sortedKeys = Object.keys(byRound).sort((a, b) => Number(b) - Number(a))
  const total = sortedKeys.length

  const rounds: BracketRound[] = sortedKeys.map((round, index) => ({
    round,
    name: getRoundName(
      byRound[round]!.length,
      index === total - 1,
      index === total - 2,
    ),
    projected: false,
    matches: (() => {
      const sorted = byRound[round]!
        .sort((a, b) => a.strTimestamp.localeCompare(b.strTimestamp))
      const ordered = round === '32' && sorted.length === 16
        ? FIFA2026_R32_ORDER.map(i => sorted[i]!)
        : sorted
      return ordered
    })().map(m => ({
        idEvent: m.idEvent,
        homeTeam: m.strHomeTeam,
        awayTeam: m.strAwayTeam,
        homeBadge: m.strHomeTeamBadge,
        awayBadge: m.strAwayTeamBadge,
        homeScore: m.intHomeScore,
        awayScore: m.intAwayScore,
        homePenScore: penScoreMap[m.idEvent]?.home ?? null,
        awayPenScore: penScoreMap[m.idEvent]?.away ?? null,
        status: m.strStatus,
        timestamp: m.strTimestamp,
      })),
  }))

  // build projected rounds from the last actual round if it has multiple matches
  const lastRound = rounds[rounds.length - 1]
  if (lastRound && lastRound.matches.length > 1) {
    rounds.push(...buildProjectedRounds(lastRound))
  }

  return { rounds }
}, {
  maxAge: 60,
  getKey: () => 'bracket-4429',
})
