<script setup lang="ts">
type Mode = 'yesterday' | 'today' | 'tomorrow' | 'custom'

const emit = defineEmits<{
  change: [{ from: string; to: string }]
}>()

const activeMode = ref<Mode>('today')
const selectedDate = ref<Date | null>(null)
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

// Moscow today as a local Date object for the DatePicker defaultDate
const moscowTodayDate = computed(() => {
  const [y, m, d] = getMoscowDateStr(0).split('-').map(Number)
  return new Date(y, m - 1, d)
})

const displayDate = ref(formatReadableDate(getMoscowDateStr(0)))

function selectDay(mode: Exclude<Mode, 'custom'>) {
  activeMode.value = mode
  selectedDate.value = null
  const dateStr = getMoscowDateStr(offsets[mode])
  displayDate.value = formatReadableDate(dateStr)
  emit('change', { from: dateStr, to: dateStr })
}

function toggleCalendar(event: Event) {
  popover.value.toggle(event)
}

watch(selectedDate, (date) => {
  if (!date) return
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const dateStr = `${y}-${m}-${d}`
  displayDate.value = formatReadableDate(dateStr)
  activeMode.value = 'custom'
  popover.value.hide()
  emit('change', { from: dateStr, to: dateStr })
})
</script>

<template>
  <div class="filter-wrap">
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
      <Button
          icon="pi pi-calendar"
          :severity="activeMode === 'custom' ? 'contrast' : 'secondary'"
          aria-label="Выбрать дату"
          @click="toggleCalendar($event)"
      />
      <Popover ref="popover">
        <DatePicker v-model="selectedDate" inline :default-date="moscowTodayDate" />
      </Popover>
    </div>
    <div class="filter__date">{{ displayDate }}</div>
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
  margin-bottom: 8px;
}

.filter__button {
  min-width: 90px;
}

.filter__date {
  font-size: 22px;
  font-weight: normal;
  color: inherit;
}

@media (min-width: $breakpoint-desktop) {
  .filter__button {
    min-width: 80px;
  }
}
</style>
