<script setup lang="ts">
import type { Match } from '~/types'

const props = defineProps<{ match: Match }>()

const liveStatuses = new Set(['1H', 'HT', '2H', 'ET', 'PEN'])
const isLive = computed(() => liveStatuses.has(props.match.strStatus))
const isPast = computed(() => ['FT', 'AET', 'AP'].includes(props.match.strStatus))


const statusMap: Record<string, string> = {
  NS: 'Не начался',
  '1H': '1-й тайм',
  HT: 'Перерыв',
  '2H': '2-й тайм',
  ET: 'Доп. время',
  PEN: 'Пенальти',
  FT: 'Завершён',
  AET: 'Завершён (ДВ)',
  AP: 'Завершён (пен.)',
}

const formatStatus = (status: string) => statusMap[status] ?? status

const formatMoscowTime = (timestamp: string) =>
    new Date(timestamp + 'Z').toLocaleTimeString('ru-RU', {
      timeZone: 'Europe/Moscow',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    })
</script>

<template>
  <div
      class="match"
      :class="{ 'match--live': isLive, 'match--past': isPast }"
  >
    <div class="match__meta">
      <template v-if="isLive">
        <div class="match__live">
          <span v-if="match.intProgress != null">{{ match.intProgress }}'</span>
          <span v-else>{{ formatStatus(match.strStatus) }}</span>
        </div>
      </template>
      <template v-else>
        <div class="match__time">{{ formatMoscowTime(match.strTimestamp) }} <span class="match__tz">МСК</span></div>
        <div class="match__status">{{ formatStatus(match.strStatus) }}</div>
      </template>
    </div>
    <MatchTeam
        :name="match.strHomeTeam"
        :badge="match.strHomeTeamBadge"
        side="left"
    />
    <MatchScore
        :home-score="match.intHomeScore"
        :away-score="match.intAwayScore"
        :home-pen-score="match.intHomeScoreExtra"
        :away-pen-score="match.intAwayScoreExtra"
    />
    <MatchTeam
        :name="match.strAwayTeam"
        :badge="match.strAwayTeamBadge"
        side="right"
    />
  </div>
</template>

<style scoped lang="scss">
.match {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #ddd;
}

.match--live {
  background-color: #f0fdf4;
  border-radius: 8px;
  padding: 12px;
  margin: 4px -12px;
  border-bottom: none;
}

.match__meta {
  width: 50px;
  font-size: 12px;
  color: #333;
  flex-shrink: 0;
}

.match__status {
  display: none;
  font-size: 12px;
  color: #777;
  white-space: nowrap;
}

.match__tz {
  display: none;
  font-size: 11px;
  color: #aaa;
}

@media (min-width: $breakpoint-nav) {
  .match__meta {
    width: 90px;
  }

  .match__status {
    display: block;
  }

  .match__tz {
    display: inline;
  }
}

@media (min-width: $breakpoint-desktop) {
  .match__meta {
    width: 95px;
    font-size: 14px;
  }

  .match__live {
    font-size: 14px;
  }
}

.match--past {
  opacity: 0.65;
}

.match__live {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #16a34a;
  white-space: nowrap;
}
</style>
