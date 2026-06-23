<script setup lang="ts">
type Mode = 'yesterday' | 'today' | 'tomorrow'

const emit = defineEmits<{
  change: [{ from: string; to: string }]
}>()

const activeMode = ref<Mode>('today')

const offsets: Record<Mode, number> = {
  yesterday: -1,
  today: 0,
  tomorrow: 1,
}

function getMoscowDateStr(offset: number): string {
  const date = new Date(Date.now() + offset * 24 * 60 * 60 * 1000)
  return date.toLocaleDateString('sv-SE', { timeZone: 'Europe/Moscow' })
}

function selectDay(mode: Mode) {
  const dateStr = getMoscowDateStr(offsets[mode])
  activeMode.value = mode
  emit('change', { from: dateStr, to: dateStr })
}
</script>

<template>
  <div class="filter" role="group" aria-label="Выбор дня">
    <Button
        class="filter__button"
        label="Сегодня"
        :severity="activeMode === 'today' ? 'contrast' : 'secondary'"
        @click="selectDay('today')"
    />
    <Button
        class="filter__button"
        label="Завтра"
        :severity="activeMode === 'tomorrow' ? 'contrast' : 'secondary'"
        @click="selectDay('tomorrow')"
    />
    <Button
        class="filter__button"
        label="Вчера"
        :severity="activeMode === 'yesterday' ? 'contrast' : 'secondary'"
        @click="selectDay('yesterday')"
    />
  </div>
</template>

<style scoped lang="scss">
.filter {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.filter__button {
  min-width: 0;
  flex: 1;
}

@media (min-width: $breakpoint-desktop) {
  .filter__button {
    min-width: 80px;
    flex: initial;
  }
}
</style>
