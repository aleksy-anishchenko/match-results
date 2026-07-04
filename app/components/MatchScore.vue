<script setup lang="ts">
defineProps<{
  homeScore: string | null
  awayScore: string | null
  homePenScore?: number | null
  awayPenScore?: number | null
}>()
</script>

<template>
  <div class="score">
    <span>{{ homeScore ?? '—' }} : {{ awayScore ?? '—' }}</span>
    <span
      v-if="homePenScore != null || awayPenScore != null"
      class="score__pen"
    >пен. {{ homePenScore ?? '?' }}:{{ awayPenScore ?? '?' }}</span>
  </div>
</template>

<style scoped lang="scss">
.score {
  width: 72px;
  text-align: center;
  padding: 4px 6px;
  font-size: 13px;
  font-weight: bold;
  background: #f0f0f0;
  border-radius: 8px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}

.score__pen {
  font-size: 11px;
  font-weight: 500;
  color: #555;
}

@media (min-width: $breakpoint-desktop) {
  .score {
    width: 82px;
    font-size: inherit;
    padding: 4px 8px;
  }
}
</style>
