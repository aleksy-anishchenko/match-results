import type { BracketMatch } from '~/types'

export const FINISHED_MATCH_STATUSES = new Set(['FT', 'AET', 'AP'])

export function getMatchWinnerSide(match: BracketMatch): 'home' | 'away' | null {
  if (!FINISHED_MATCH_STATUSES.has(match.status)) return null
  const homeScore = Number(match.homeScore ?? 0)
  const awayScore = Number(match.awayScore ?? 0)
  if (homeScore > awayScore) return 'home'
  if (awayScore > homeScore) return 'away'
  if (match.status === 'AP') {
    const homePenalties = match.homePenScore ?? 0
    const awayPenalties = match.awayPenScore ?? 0
    if (homePenalties > awayPenalties) return 'home'
    if (awayPenalties > homePenalties) return 'away'
  }
  return null
}
