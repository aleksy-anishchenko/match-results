<script setup lang="ts">
import type { Match } from '~/types'

defineProps<{ matches: Record<string, Match[]> }>()
</script>

<template>
  <ul class="match-list">
    <li
        v-for="(dayMatches, date) in matches"
        :key="date"
        class="match-group"
    >
      <h2 class="match-date">{{ formatReadableDate(String(date)) }}</h2>
      <ul class="match-items">
        <li v-for="match in dayMatches" :key="match.idEvent">
          <MatchItem :match="match" />
        </li>
      </ul>
    </li>
  </ul>
</template>

<style scoped>
.match-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 800px;
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
