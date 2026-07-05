<script setup lang="ts">
import type { StandingsResponse, BracketResponse } from '~/types'

useHead({ title: 'Турнирная таблица' })

const activeTab = ref<'playoff' | 'groups'>('playoff')

const [{ data: standingsData }, { data: bracketData }] = await Promise.all([
  useFetch<StandingsResponse>('/api/standings'),
  useFetch<BracketResponse>('/api/bracket'),
])

const groups = computed(() => standingsData.value?.groups ?? {})
const rounds = computed(() => bracketData.value?.rounds ?? [])

const advancedTeams = computed(() => {
  const roundOf32 = bracketData.value?.rounds.find(round => !round.projected)
  if (!roundOf32) return null
  const teams = new Set<string>()
  for (const match of roundOf32.matches) {
    if (match.homeTeam) teams.add(match.homeTeam)
    if (match.awayTeam) teams.add(match.awayTeam)
  }
  return teams
})

function isAdvancing(team: string, index: number): boolean {
  return advancedTeams.value ? advancedTeams.value.has(team) : index < 2
}

function isPossiblyAdvancing(index: number): boolean {
  return !advancedTeams.value && index === 2
}

function goalDiffClass(goalDiff: number): string {
  if (goalDiff > 0) return 'table__diff--pos'
  if (goalDiff < 0) return 'table__diff--neg'
  return ''
}
</script>

<template>
  <div>
    <h1 class="page-title">
      Турнирная таблица
    </h1>

    <div class="tabs">
      <button
        class="tab"
        :class="{ 'tab--active': activeTab === 'playoff' }"
        @click="activeTab = 'playoff'"
      >
        Плей-офф
      </button>
      <button
        class="tab"
        :class="{ 'tab--active': activeTab === 'groups' }"
        @click="activeTab = 'groups'"
      >
        Группы
      </button>
    </div>

    <template v-if="activeTab === 'playoff'">
      <p
        v-if="!rounds.length"
        class="empty"
      >
        Плей-офф ещё не начался
      </p>
      <TournamentBracket
        v-else
        :rounds="rounds"
      />
    </template>

    <template v-else>
      <div class="groups">
        <div
          v-for="(standings, letter) in groups"
          :key="letter"
          class="group"
        >
          <h2 class="group__title">
            Группа {{ letter }}
          </h2>
          <table class="table">
            <thead>
              <tr>
                <th class="table__team-col" />
                <th title="Игры">
                  И
                </th>
                <th title="Победы">
                  В
                </th>
                <th title="Ничьи">
                  Н
                </th>
                <th title="Поражения">
                  П
                </th>
                <th
                  class="table__goals-col"
                  title="Голы забитые : пропущенные"
                >
                  Г
                </th>
                <th title="Разность голов">
                  РГ
                </th>
                <th title="Очки">
                  О
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, index) in standings"
                :key="row.team"
                :class="{
                  'table__row--advance': isAdvancing(row.team, index),
                  'table__row--maybe': isPossiblyAdvancing(index),
                }"
              >
                <td class="table__team">
                  <span class="table__position">{{ index + 1 }}</span>
                  <img
                    :src="`/api/image?url=${encodeURIComponent(row.badge)}`"
                    width="20"
                    height="20"
                    :alt="row.team"
                    class="table__badge"
                  >
                  <span class="table__name">{{ getTeamName(row.team) }}</span>
                </td>
                <td>{{ row.played }}</td>
                <td>{{ row.won }}</td>
                <td>{{ row.drawn }}</td>
                <td>{{ row.lost }}</td>
                <td class="table__goals">
                  {{ row.goalsFor }}:{{ row.goalsAgainst }}
                </td>
                <td :class="goalDiffClass(row.goalDiff)">
                  {{ row.goalDiff > 0 ? '+' : '' }}{{ row.goalDiff }}
                </td>
                <td class="table__points">
                  {{ row.points }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.page-title {
  font-size: 26px;
  font-weight: bold;
  margin-bottom: 20px;
}

.tabs {
  display: flex;
  gap: 0;
  border-bottom: 2px solid #eee;
  margin-bottom: 24px;
}

.tab {
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #888;
  background: none;
  border: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: color 0.15s, border-color 0.15s;

  &:hover {
    color: #333;
  }

  &--active {
    color: #111;
    border-bottom-color: #111;
  }
}

.empty {
  color: #aaa;
  font-size: 14px;
  padding: 32px 0;
}

.groups {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  padding-bottom: 48px;
}

.group {
  max-width: 500px;
  margin: 0 auto;
  width: 100%;
}

.group__title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-size: 12px;
}

.table thead th {
  text-align: center;
  padding: 4px 4px;
  color: #999;
  font-weight: 500;
  border-bottom: 1px solid #eee;
}

.table thead th:not(.table__team-col) {
  width: 26px;
}

.table__team-col {
  text-align: left !important;
}

.table tbody td {
  padding: 6px 4px;
  text-align: center;
  border-bottom: 1px solid #f3f3f3;
}

.table__row--advance {
  background-color: #f0faf4;
}

.table__row--maybe {
  background-color: #fefce8;
}

.table__team {
  display: flex;
  align-items: center;
  gap: 6px;
  text-align: left !important;
  overflow: hidden;
}

.table__position {
  color: #bbb;
  font-size: 12px;
  width: 12px;
  flex-shrink: 0;
}

.table__badge {
  flex-shrink: 0;
  object-fit: contain;
}

.table__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.table__goals-col,
.table__goals {
  display: none;
}

.table__goals {
  color: #666;
}

.table__points {
  font-weight: 700;
}

.table__diff--pos {
  color: #16a34a;
}

.table__diff--neg {
  color: #dc2626;
}

@media (min-width: $breakpoint-nav) {
  .table {
    font-size: 14px;
  }

  .table thead th:not(.table__team-col) {
    width: 36px;
    padding: 4px 6px;
  }

  .table tbody td {
    padding: 6px;
  }

  .table__team {
    gap: 8px;
  }

  .table__goals-col,
  .table__goals {
    display: table-cell;
  }
}

@media (min-width: $breakpoint-desktop) {
  .groups {
    grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  }
}
</style>
