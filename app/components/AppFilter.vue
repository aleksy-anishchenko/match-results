<script setup lang="ts">
type Mode = 'yesterday' | 'today' | 'tomorrow' | 'custom'

const emit = defineEmits<{
  change: [{ from: string, to: string }]
}>()

const activeMode = ref<Mode>('today')
const selectedRange = ref<Date[] | null>(null)
const popover = ref()

const offsets: Record<Exclude<Mode, 'custom'>, number> = {
  yesterday: -1,
  today: 0,
  tomorrow: 1,
}

function getMoscowDateStr(offset: number): string {
  const date = new Date(Date.now() + offset * 24 * 60 * 60 * 1000)
  return date.toLocaleDateString('sv-SE', { timeZone: 'Europe/Moscow' })
}

function toDateStr(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Moscow today as a local Date object for the DatePicker defaultDate
const moscowTodayDate = computed(() => {
  const [year, month, day] = getMoscowDateStr(0).split('-').map(Number) as [number, number, number]
  return new Date(year, month - 1, day)
})

function selectDay(mode: Exclude<Mode, 'custom'>) {
  activeMode.value = mode
  selectedRange.value = null
  const dateStr = getMoscowDateStr(offsets[mode])
  emit('change', { from: dateStr, to: dateStr })
}

function toggleCalendar(event: Event) {
  popover.value.toggle(event)
}

watch(selectedRange, (range) => {
  if (!range || range.length < 2) return
  const [from, to] = range
  if (!from || !to) return
  const [start, end] = from.getTime() <= to.getTime() ? [from, to] : [to, from]
  activeMode.value = 'custom'
  popover.value.hide()
  emit('change', { from: toDateStr(start), to: toDateStr(end) })
})
</script>

<template>
  <div class="filter-wrap">
    <div
      class="filter"
      role="group"
      aria-label="Выбор дня"
    >
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
      <Button
        icon="pi pi-calendar"
        :severity="activeMode === 'custom' ? 'contrast' : 'secondary'"
        aria-label="Выбрать диапазон дат"
        @click="toggleCalendar($event)"
      />
      <Popover ref="popover">
        <DatePicker
          v-model="selectedRange"
          inline
          selection-mode="range"
          :default-date="moscowTodayDate"
        />
      </Popover>
    </div>
  </div>
</template>

<style scoped lang="scss">
.filter-wrap {
  margin-bottom: 16px;
}

.filter {
  display: flex;
  gap: 8px;
  align-items: center;
}

.filter__button {
  min-width: 90px;
}

@media (min-width: $breakpoint-desktop) {
  .filter__button {
    min-width: 80px;
  }
}
</style>
