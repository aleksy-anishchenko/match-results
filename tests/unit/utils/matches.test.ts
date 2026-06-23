import { describe, it, expect } from 'vitest'
import { groupMatchesByDate, formatReadableDate } from '~/utils/matches'
import type { Match } from '~/types'

const makeMatch = (overrides: Partial<Match>): Match => ({
  idEvent: '1',
  strHomeTeam: 'Brazil',
  strAwayTeam: 'Germany',
  strHomeTeamBadge: '',
  strAwayTeamBadge: '',
  intHomeScore: null,
  intAwayScore: null,
  strStatus: 'NS',
  intProgress: null,
  strTimestamp: '2026-06-23T10:00:00',
  dateEvent: '2026-06-23',
  strGroup: null,
  strSeason: '2026',
  ...overrides,
})

describe('groupMatchesByDate', () => {
  it('группирует матчи по московской дате', () => {
    const match = makeMatch({ strTimestamp: '2026-06-23T10:00:00' }) // 13:00 МСК
    const result = groupMatchesByDate([match])
    expect(Object.keys(result)).toEqual(['2026-06-23'])
  })

  it('матч в 21:00 UTC попадает в следующий день по МСК (00:00 МСК)', () => {
    // Это был реальный баг: API возвращал dateEvent=2026-06-22,
    // но в Москве матч начинался уже 23 июня в 00:00
    const match = makeMatch({ strTimestamp: '2026-06-22T21:00:00' })
    const result = groupMatchesByDate([match])
    expect(Object.keys(result)).toContain('2026-06-23')
    expect(Object.keys(result)).not.toContain('2026-06-22')
  })

  it('матч в 20:59 UTC остаётся в том же дне по МСК (23:59 МСК)', () => {
    const match = makeMatch({ strTimestamp: '2026-06-22T20:59:00' })
    const result = groupMatchesByDate([match])
    expect(Object.keys(result)).toContain('2026-06-22')
    expect(Object.keys(result)).not.toContain('2026-06-23')
  })

  it('матчи разных дней группируются отдельно', () => {
    const matches = [
      makeMatch({ idEvent: '1', strTimestamp: '2026-06-22T12:00:00' }),
      makeMatch({ idEvent: '2', strTimestamp: '2026-06-23T12:00:00' }),
      makeMatch({ idEvent: '3', strTimestamp: '2026-06-23T15:00:00' }),
    ]
    const result = groupMatchesByDate(matches)
    expect(Object.keys(result)).toHaveLength(2)
    expect(result['2026-06-22']).toHaveLength(1)
    expect(result['2026-06-23']).toHaveLength(2)
  })

  it('возвращает пустой объект для пустого массива', () => {
    expect(groupMatchesByDate([])).toEqual({})
  })
})

describe('formatReadableDate', () => {
  it('форматирует дату на русском языке', () => {
    const result = formatReadableDate('2026-06-23')
    expect(result).toContain('июня')
    expect(result).toContain('2026')
  })

  it('первая буква заглавная', () => {
    const result = formatReadableDate('2026-06-23')
    expect(result[0]).toMatch(/[А-ЯЁ]/)
  })
})
