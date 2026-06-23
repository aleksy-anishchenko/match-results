import type {Match} from '~/types'

export function groupMatchesByDate(matches: Match[]): Record<string, Match[]> {
  return matches.reduce((acc, match) => {
    const date = new Date(match.strTimestamp + 'Z').toLocaleDateString('sv-SE', { timeZone: 'Europe/Moscow' })
    if (!acc[date]) acc[date] = []
    acc[date]!.push(match)
    return acc
  }, {} as Record<string, Match[]>)
}

export function formatReadableDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const formatted = date.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}
