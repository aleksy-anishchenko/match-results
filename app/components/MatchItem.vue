<script
    setup
    lang="ts"
>
import type {Match} from '~/types'

const props = defineProps<{ match: Match }>()

const liveStatuses = new Set(['1H', 'HT', '2H', 'ET', 'PEN'])
const isLive = computed(() => liveStatuses.has(props.match.strStatus))

const statusMap: Record<string, string> = {
  NS: 'Не начался',
  '1H': '1-й тайм',
  HT: 'Перерыв',
  '2H': '2-й тайм',
  ET: 'Доп. время',
  PEN: 'Пенальти',
  FT: 'Завершён',
  AET: 'Завершён (ДВ)',
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
      :class="{ 'match--live': isLive }"
  >
    <div class="match__meta">
      <template v-if="isLive">
        <div class="match__live">
          Сейчас
          <span v-if="match.intProgress">{{ match.intProgress }}</span>
        </div>
      </template>
      <template v-else>
        <div class="match__time">{{ formatMoscowTime(match.strTimestamp) }}</div>
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
    />
    <MatchTeam
        :name="match.strAwayTeam"
        :badge="match.strAwayTeamBadge"
        side="right"
    />
  </div>
</template>

<style scoped>
.match {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #ddd;
}

.match--live {
  background-color: #fff0ef;
  border-radius: 8px;
  padding: 12px;
  margin: 4px -12px;
  border-bottom: none;
}

.match__meta {
  width: 90px;
  font-size: 14px;
  color: #333;
  flex-shrink: 0;
}

.match__status {
  font-size: 12px;
  color: #777;
}

.match__live {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #f87171;
}
</style>
