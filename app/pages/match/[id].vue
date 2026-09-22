<script setup lang="ts">
import type { MatchDetails } from '~/types'

const route = useRoute()

const { data: match, pending, error } = await useFetch<MatchDetails>(`/api/match/${route.params.id}`)

useHead({ title: 'Матч' })

function teamBadgeUrl(badge: string): string {
  return badge ? `/api/image?url=${encodeURIComponent(badge)}` : ''
}

const venueParts = computed(() => {
  if (!match.value) return ''
  return [match.value.venue, match.value.city, match.value.country]
    .filter(Boolean)
    .join(', ')
})
</script>

<template>
  <div class="match-page">
    <NuxtLink
      to="/"
      class="back"
    >
      ← К результатам
    </NuxtLink>

    <p v-if="pending">
      Загрузка...
    </p>

    <p
      v-else-if="error"
      class="empty"
    >
      Матч не найден
    </p>

    <template v-else-if="match">
      <div class="match-head">
        <div class="match-head__meta">
          {{ match.league }} · {{ match.season }}
          <span v-if="match.round"> · тур {{ match.round }}</span>
        </div>
        <div class="match-head__teams">
          <div class="match-head__team">
            <img
              :src="teamBadgeUrl(match.homeBadge)"
              :alt="match.homeTeam"
            >
            <div class="match-head__name">
              {{ getTeamName(match.homeTeam) }}
            </div>
          </div>
          <div class="match-head__score">
            <div class="match-head__goals">
              {{ match.homeScore ?? '—' }} : {{ match.awayScore ?? '—' }}
            </div>
            <div
              v-if="match.homePenScore != null || match.awayPenScore != null"
              class="match-head__pen"
            >
              пен. {{ match.homePenScore ?? '?' }}:{{ match.awayPenScore ?? '?' }}
            </div>
            <div class="match-head__status">
              {{ formatMatchStatus(match.status) }}
            </div>
          </div>
          <div class="match-head__team match-head__team--away">
            <img
              :src="teamBadgeUrl(match.awayBadge)"
              :alt="match.awayTeam"
            >
            <div class="match-head__name">
              {{ getTeamName(match.awayTeam) }}
            </div>
          </div>
        </div>
      </div>

      <div class="match-info">
        <div class="match-info__row">
          <span class="match-info__label">Дата</span>
          <span class="match-info__value">
            {{ formatMoscowDate(match.date) }}, {{ match.time }}
            <span class="match-info__tz">МСК</span>
          </span>
        </div>
        <div
          v-if="venueParts"
          class="match-info__row"
        >
          <span class="match-info__label">Стадион</span>
          <span class="match-info__value">{{ venueParts }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.match-page {
  max-width: 760px;
  margin: 0 auto;
}

.back {
  display: inline-block;
  margin-bottom: 20px;
  color: #555;
  font-size: 14px;

  &:hover {
    color: #111;
  }
}

.empty {
  color: #aaa;
  font-size: 14px;
  padding: 32px 0;
}

.match-head {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 20px 16px;
  margin-bottom: 16px;
}

.match-head__meta {
  text-align: center;
  font-size: 13px;
  color: #888;
  margin-bottom: 18px;
}

.match-head__teams {
  display: flex;
  align-items: center;
  gap: 12px;
}

.match-head__team {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;

  img {
    width: 52px;
    height: 52px;
  }
}

.match-head__name {
  font-size: 15px;
  font-weight: 600;
}

.match-head__score {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 100px;
}

.match-head__goals {
  font-size: 30px;
  font-weight: bold;
}

.match-head__pen {
  font-size: 13px;
  color: #666;
}

.match-head__status {
  font-size: 12px;
  color: #888;
}

.match-info {
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 8px 16px;
}

.match-info__row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;

  &:last-child {
    border-bottom: none;
  }
}

.match-info__label {
  color: #888;
  flex-shrink: 0;
}

.match-info__value {
  text-align: right;
}

.match-info__tz {
  color: #aaa;
  font-size: 12px;
}
</style>
