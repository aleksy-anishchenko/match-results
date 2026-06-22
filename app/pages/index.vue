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
</script>

<template>
  <div>
    <h1 class="page-title">Чемпионат мира (FIFA)</h1>
    <AppFilter @change="dateRange = $event" />
    <p v-if="pending">Загрузка...</p>
    <p v-else-if="!Object.keys(groupedMatches).length">Матчей нет</p>
    <MatchList
        v-else
        :matches="groupedMatches"
    />
  </div>
</template>

<style scoped>
.page-title {
  font-size: 26px;
  font-weight: bold;
  margin-bottom: 16px;
}
</style>
