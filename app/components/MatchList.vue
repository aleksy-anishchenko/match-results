<script
    setup
    lang="ts"
>
import type {Match} from '~/types'

defineProps<{ matches: Record<string, Match[]> }>()
</script>

<template>
  <div class="match-list">
    <div
        v-for="(dayMatches, date) in matches"
        :key="date"
        class="match-group"
    >
      <h2 class="match-date">{{ formatReadableDate(String(date)) }}</h2>
      <div class="match-items">
        <MatchItem
            v-for="match in dayMatches"
            :key="match.idEvent"
            :match="match"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.match-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.match-date {
  margin-bottom: 15px;
  font-weight: normal;
  font-size: 22px;
}

.match-items {
  margin-bottom: 25px;
}
</style>
