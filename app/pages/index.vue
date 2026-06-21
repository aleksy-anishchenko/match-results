<script
    setup
    lang="ts"
>
import type {MatchesResponse} from '~/types'

const today = new Date().toISOString().split('T')[0] ?? ''
const nextWeek = new Date()
nextWeek.setDate(nextWeek.getDate() + 6)
const nextWeekStr = nextWeek.toISOString().split('T')[0] ?? ''

const {data, pending} = await useFetch<MatchesResponse>('/api/matches', {
  query: {
    leagueId: '4429',
    dateFrom: today,
    dateTo: nextWeekStr,
  }
})

const groupedMatches = computed(() =>
    groupMatchesByDate(data.value?.matches ?? [])
)
</script>

<template>
  <div>
    <h1 class="page-title">Чемпионат мира (FIFA)</h1>
    <p v-if="pending">Загрузка...</p>
    <p v-else-if="!Object.keys(groupedMatches).length">Матчей в ближайшую неделю нет</p>
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
  margin-bottom: 24px;
}
</style>
