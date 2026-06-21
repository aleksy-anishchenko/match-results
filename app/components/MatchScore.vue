<script
    setup
    lang="ts"
>
defineProps<{
  homeScore: string | null
  awayScore: string | null
}>()
</script>

<template>
  <div class="score">
    {{ homeScore ?? '—' }} : {{ awayScore ?? '—' }}
  </div>
</template>

<style scoped>
.score {
  width: 80px;
  text-align: center;
  padding: 4px 8px;
  font-weight: bold;
  background: #f0f0f0;
  border-radius: 8px;
  flex-shrink: 0;
}
</style>
