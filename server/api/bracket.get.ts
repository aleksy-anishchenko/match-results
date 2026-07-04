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
// sequential pairing produces correct Round of 16 matchups.
const FIFA2026_R32_ORDER = [0, 3, 2, 5, 8, 9, 10, 11, 1, 4, 6, 7, 12, 15, 13, 14]

// For rounds after R32: sort matches by bracket position derived from prev round.
// Also detects when home/away are reversed vs bracket seeding and flags for swap.
// Even-indexed prev match winner → home (top); odd-indexed → away (bottom).
function sortByBracketPosition(
  matches: ApiMatch[],
  prevMatches: BracketMatch[],
): Array<{ match: ApiMatch; swapped: boolean }> {
  const slotCount = Math.floor(prevMatches.length / 2)
  const result: ({ match: ApiMatch; swapped: boolean } | null)[] = new Array(slotCount).fill(null)
  const placedIds = new Set<string>()

  for (const match of matches) {
    for (let i = 0; i < prevMatches.length; i++) {
      const prev = prevMatches[i]!
      const prevTeams = [prev.homeTeam, prev.awayTeam]
      const homeInPrev = prevTeams.includes(match.strHomeTeam)
      const awayInPrev = prevTeams.includes(match.strAwayTeam)
      if (!homeInPrev && !awayInPrev) continue

      const slot = Math.floor(i / 2)
      if (!result[slot]) {
        // Even prev index → winner should be home (top in bracket)
        const isEven = i % 2 === 0
        const swapped = homeInPrev ? !isEven : isEven
        result[slot] = { match, swapped }
        placedIds.add(match.idEvent)
      }
      break
    }
  }

  const remaining = matches.filter(m => !placedIds.has(m.idEvent))
  let ri = 0
  return result.map(r => r ?? { match: remaining[ri++] ?? matches[0]!, swapped: false })
}

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

  const rounds: BracketRound[] = []

  for (let index = 0; index < sortedKeys.length; index++) {
    const round = sortedKeys[index]!
    const sorted = byRound[round]!.sort((a, b) => a.strTimestamp.localeCompare(b.strTimestamp))

    type Ordered = { match: ApiMatch; swapped: boolean }
    let ordered: Ordered[]

    if (round === '32' && sorted.length === 16) {
      // R32: hardcoded FIFA 2026 seeding order (no previous round to reference)
      ordered = FIFA2026_R32_ORDER.map(i => ({ match: sorted[i]!, swapped: false }))
    } else if (rounds.length > 0) {
      // All subsequent rounds: derive position and home/away order from previous round
      ordered = sortByBracketPosition(sorted, rounds[rounds.length - 1]!.matches)
    } else {
      ordered = sorted.map(m => ({ match: m, swapped: false }))
    }

    const bracketMatches: BracketMatch[] = ordered.map(({ match: m, swapped }) => {
      const pen = penScoreMap[m.idEvent]
      return {
        idEvent: m.idEvent,
        homeTeam: swapped ? m.strAwayTeam : m.strHomeTeam,
        awayTeam: swapped ? m.strHomeTeam : m.strAwayTeam,
        homeBadge: swapped ? m.strAwayTeamBadge : m.strHomeTeamBadge,
        awayBadge: swapped ? m.strHomeTeamBadge : m.strAwayTeamBadge,
        homeScore: swapped ? m.intAwayScore : m.intHomeScore,
        awayScore: swapped ? m.intHomeScore : m.intAwayScore,
        homePenScore: swapped ? (pen?.away ?? null) : (pen?.home ?? null),
        awayPenScore: swapped ? (pen?.home ?? null) : (pen?.away ?? null),
        status: m.strStatus,
        timestamp: m.strTimestamp,
      }
    })

    rounds.push({
      round,
      name: getRoundName(bracketMatches.length, index === total - 1, index === total - 2),
      projected: false,
      matches: bracketMatches,
    })
  }

  // Build projected rounds from the last actual round if it has multiple matches
  const lastRound = rounds[rounds.length - 1]
  if (lastRound && lastRound.matches.length > 1) {
    rounds.push(...buildProjectedRounds(lastRound))
  }

  return { rounds }
}, {
  maxAge: 60,
  getKey: () => 'bracket-4429',
})
