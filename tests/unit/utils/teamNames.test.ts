import { describe, it, expect } from 'vitest'
import { getTeamName } from '~/utils/teamNames'

describe('getTeamName', () => {
  it('переводит известную команду на русский', () => {
    expect(getTeamName('France')).toBe('Франция')
    expect(getTeamName('Brazil')).toBe('Бразилия')
    expect(getTeamName('Germany')).toBe('Германия')
  })

  it('возвращает оригинальное название для неизвестной команды', () => {
    expect(getTeamName('Unknown FC')).toBe('Unknown FC')
  })

  it('регистр имеет значение', () => {
    expect(getTeamName('france')).toBe('france')
  })
})
