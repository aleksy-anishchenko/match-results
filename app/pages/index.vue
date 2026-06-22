<script
    setup
    lang="ts"
>
import type {MatchesResponse} from '~/types'

const dateFrom = new Date()
dateFrom.setDate(dateFrom.getDate() - 2)
const dateFromStr = dateFrom.toISOString().split('T')[0] ?? ''

const dateTo = new Date()
dateTo.setDate(dateTo.getDate() + 6)
const dateToStr = dateTo.toISOString().split('T')[0] ?? ''

const {data, pending} = await useFetch<MatchesResponse>('/api/matches', {
  query: {
    leagueId: '4429',
    dateFrom: dateFromStr,
    dateTo: dateToStr,
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
