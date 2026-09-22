<script setup lang="ts">
import type { Match } from '~/types'

const props = defineProps<{ match: Match }>()

const liveStatuses = new Set(['1H', 'HT', '2H', 'ET', 'PEN'])
const isLive = computed(() => liveStatuses.has(props.match.status))
const isPast = computed(() => FINISHED_MATCH_STATUSES.has(props.match.status))
</script>

<template>
  <NuxtLink
    :to="`/match/${match.idEvent}`"
    class="match"
    :class="{ 'match--live': isLive, 'match--past': isPast }"
  >
    <div class="match__meta">
      <template v-if="isLive">
        <div class="match__live">
          <span v-if="match.progress != null">{{ match.progress }}'</span>
          <span v-else>{{ formatMatchStatus(match.status) }}</span>
        </div>
      </template>
      <template v-else>
        <div class="match__time">
          {{ formatMoscowTime(match.timestamp) }} <span class="match__tz">МСК</span>
        </div>
        <div class="match__status">
          {{ formatMatchStatus(match.status) }}
        </div>
      </template>
    </div>
    <MatchTeam
      :name="match.homeTeam"
      :badge="match.homeBadge"
      side="left"
    />
    <MatchScore
      :home-score="match.homeScore"
      :away-score="match.awayScore"
      :home-pen-score="match.homePenScore"
      :away-pen-score="match.awayPenScore"
    />
    <MatchTeam
      :name="match.awayTeam"
      :badge="match.awayBadge"
      side="right"
    />
  </NuxtLink>
</template>

<style scoped lang="scss">
.match {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #ddd;
  color: inherit;
  text-decoration: none;
}

.match:hover {
  background-color: #f7f7f7;
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
