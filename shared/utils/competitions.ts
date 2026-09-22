import type { Competition } from '~/types'

export const COMPETITION_CATEGORIES = [
  'Топ-лиги',
  'Россия',
  'Другие лиги',
  'Еврокубки',
  'Сборные',
] as const

export const COMPETITIONS: Competition[] = [
  {
    id: '4328',
    name: 'АПЛ',
    country: 'Англия',
    type: 'league',
    category: 'Топ-лиги',
  },
  {
    id: '4335',
    name: 'Ла Лига',
    country: 'Испания',
    type: 'league',
    category: 'Топ-лиги',
  },
  {
    id: '4332',
    name: 'Серия А',
    country: 'Италия',
    type: 'league',
    category: 'Топ-лиги',
  },
  {
    id: '4331',
    name: 'Бундеслига',
    country: 'Германия',
    type: 'league',
    category: 'Топ-лиги',
  },
  {
    id: '4334',
    name: 'Лига 1',
    country: 'Франция',
    type: 'league',
    category: 'Топ-лиги',
  },
  {
    id: '4355',
    name: 'РПЛ',
    country: 'Россия',
    type: 'league',
    category: 'Россия',
  },
  {
    id: '4344',
    name: 'Примейра-лига',
    country: 'Португалия',
    type: 'league',
    category: 'Другие лиги',
    whiteBadge: true,
  },
  {
    id: '4337',
    name: 'Эредивизи',
    country: 'Нидерланды',
    type: 'league',
    category: 'Другие лиги',
    whiteBadge: true,
  },
  {
    id: '4338',
    name: 'Про-лига',
    country: 'Бельгия',
    type: 'league',
    category: 'Другие лиги',
    whiteBadge: true,
  },
  {
    id: '4339',
    name: 'Суперлига',
    country: 'Турция',
    type: 'league',
    category: 'Другие лиги',
  },
  {
    id: '4480',
    name: 'Лига чемпионов',
    country: 'Европа',
    type: 'tournament',
    category: 'Еврокубки',
    groupRounds: ['1', '2', '3', '4', '5', '6', '7', '8'],
    whiteBadge: true,
  },
  {
    id: '4481',
    name: 'Лига Европы',
    country: 'Европа',
    type: 'tournament',
    category: 'Еврокубки',
    groupRounds: ['1', '2', '3', '4', '5', '6', '7', '8'],
    whiteBadge: true,
  },
  {
    id: '4429',
    name: 'Чемпионат мира',
    country: 'Мир',
    type: 'tournament',
    category: 'Сборные',
    groupRounds: ['1', '2', '3'],
    whiteBadge: true,
  },
  {
    id: '4502',
    name: 'Чемпионат Европы',
    country: 'Европа',
    type: 'tournament',
    category: 'Сборные',
    groupRounds: ['1', '2', '3'],
  },
  {
    id: '4499',
    name: 'Кубок Америки',
    country: 'Америка',
    type: 'tournament',
    category: 'Сборные',
    groupRounds: ['1', '2', '3'],
  },
  {
    id: '4490',
    name: 'Лига наций',
    country: 'Европа',
    type: 'tournament',
    category: 'Сборные',
    groupRounds: ['1', '2', '3', '4', '5', '6'],
  },
]

export const DEFAULT_COMPETITION_ID = '4328'

export function getCompetition(id: string | number | null | undefined): Competition | undefined {
  return COMPETITIONS.find(competition => competition.id === String(id))
}
