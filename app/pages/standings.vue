<script setup lang="ts">
import type { StandingsResponse } from '~/types'

useHead({ title: 'Турнирная таблица' })

const { data } = await useFetch<StandingsResponse>('/api/standings')

const groups = computed(() => data.value?.groups ?? {})
</script>

<template>
  <h1 class="page-title">Групповой этап</h1>

  <div class="groups">
      <div
          v-for="(standings, letter) in groups"
          :key="letter"
          class="group"
      >
        <h2 class="group__title">Группа {{ letter }}</h2>
        <table class="table">
          <thead>
            <tr>
              <th class="table__team-col"></th>
              <th title="Игры">И</th>
              <th title="Победы">В</th>
              <th title="Ничьи">Н</th>
              <th title="Поражения">П</th>
              <th class="table__goals-col" title="Голы забитые : пропущенные">Г</th>
              <th title="Разность голов">РГ</th>
              <th title="Очки">О</th>
            </tr>
          </thead>
          <tbody>
            <tr
                v-for="(row, index) in standings"
                :key="row.team"
                :class="{
                  'table__row--advance': index < 2,
                  'table__row--maybe': index === 2,
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
                />
                <span class="table__name">{{ getTeamName(row.team) }}</span>
              </td>
              <td>{{ row.played }}</td>
              <td>{{ row.won }}</td>
              <td>{{ row.drawn }}</td>
              <td>{{ row.lost }}</td>
              <td class="table__goals">{{ row.goalsFor }}:{{ row.goalsAgainst }}</td>
              <td :class="row.goalDiff > 0 ? 'table__diff--pos' : row.goalDiff < 0 ? 'table__diff--neg' : ''">
                {{ row.goalDiff > 0 ? '+' : '' }}{{ row.goalDiff }}
              </td>
              <td class="table__points">{{ row.points }}</td>
            </tr>
          </tbody>
        </table>
      </div>
  </div>
</template>

<style scoped lang="scss">
.page-title {
  font-size: 26px;
  font-weight: bold;
  margin-bottom: 24px;
}

.groups {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  padding-bottom: 48px;
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

@media (min-width: $breakpoint-desktop) {
  .groups {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  }

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
</style>
