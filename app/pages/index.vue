<script setup lang="ts">
import type { MatchesResponse } from '~/types'

const { competition } = useCompetition()

const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Moscow' })
const dateRange = ref({ from: today, to: today })

const { data, pending } = await useFetch<MatchesResponse>('/api/matches', {
  query: computed(() => ({
    leagueId: competition.value.id,
    dateFrom: dateRange.value.from,
    dateTo: dateRange.value.to,
  })),
})

const groupedMatches = computed(() =>
  groupMatchesByDate(data.value?.matches ?? []),
)
</script>

<template>
  <div>
    <AppFilter @change="dateRange = $event" />
    <p v-if="pending">
      Загрузка...
    </p>
    <p v-else-if="!Object.keys(groupedMatches).length">
      Матчей нет
    </p>
    <MatchList
      v-else
      :matches="groupedMatches"
      :show-date="true"
    />
  </div>
</template>
