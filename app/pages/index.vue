<script setup lang="ts">
import type {MatchesResponse} from '~/types'

const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Moscow' })
const dateRange = ref({ from: today, to: today })

const { data, pending } = await useFetch<MatchesResponse>('/api/matches', {
  query: computed(() => ({
    leagueId: '4429',
    dateFrom: dateRange.value.from,
    dateTo: dateRange.value.to,
  }))
})

const groupedMatches = computed(() =>
    groupMatchesByDate(data.value?.matches ?? [])
)

const { data: leagueData } = await useFetch<{ badge: string | null }>('/api/league', {
  query: { leagueId: '4429' }
})

const leagueBadgeUrl = computed(() => {
  const badge = leagueData.value?.badge
  return badge ? `/api/image?url=${encodeURIComponent(badge)}` : null
})
</script>

<template>
  <div>
    <div class="page-header">
      <img
          v-if="leagueBadgeUrl"
          :src="leagueBadgeUrl"
          alt="FIFA World Cup 2026"
          class="page-header__logo"
      />
      <h1 class="page-header__title">Чемпионат мира по футболу FIFA 2026</h1>
    </div>
    <AppFilter @change="dateRange = $event" />
    <p v-if="pending">Загрузка...</p>
    <p v-else-if="!Object.keys(groupedMatches).length">Матчей нет</p>
    <MatchList
        v-else
        :matches="groupedMatches"
    />
  </div>
</template>

<style scoped lang="scss">
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.page-header__logo {
  width: 36px;
  height: 36px;
  object-fit: contain;
  flex-shrink: 0;
}

.page-header__title {
  font-size: 16px;
  font-weight: bold;
}

@media (min-width: $breakpoint-desktop) {
  .page-header__logo {
    width: 48px;
    height: 48px;
  }

  .page-header__title {
    font-size: 26px;
  }
}
</style>
