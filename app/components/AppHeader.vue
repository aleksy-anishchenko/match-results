<script setup lang="ts">
import type { CompetitionWithBadge } from '~/types'

const { selectedId } = useCompetition()

const isOpen = ref(false)
const route = useRoute()

watch(route, () => {
  isOpen.value = false
})

const { data: competitionsData } = await useFetch<{ competitions: CompetitionWithBadge[] }>('/api/competitions')

const badgeById = computed(() => {
  const map: Record<string, string> = {}
  for (const competition of competitionsData.value?.competitions ?? []) {
    if (competition.badge) map[competition.id] = competition.badge
  }
  return map
})

const competitionGroups = COMPETITION_CATEGORIES.map(category => ({
  label: category,
  items: COMPETITIONS.filter(competition => competition.category === category),
}))

function competitionName(id: string): string {
  return getCompetition(id)?.name ?? ''
}

function isWhiteBadge(id: string): boolean {
  return getCompetition(id)?.whiteBadge ?? false
}

function badgeUrl(id: string): string {
  const badge = badgeById.value[id]
  return badge ? `/api/image?url=${encodeURIComponent(badge)}` : ''
}
</script>

<template>
  <header class="header container">
    <NuxtLink
      to="/"
      class="logo"
    >
      <span class="logo__dot" />
      <span class="logo__text">MatchResults</span>
    </NuxtLink>

    <ul class="nav">
      <li><NuxtLink to="/">Результаты</NuxtLink></li>
      <li><NuxtLink to="/standings">Таблица</NuxtLink></li>
      <li><NuxtLink to="/about">О проекте</NuxtLink></li>
    </ul>

    <div class="header__select">
      <Select
        v-model="selectedId"
        :options="competitionGroups"
        option-label="name"
        option-value="id"
        option-group-label="label"
        option-group-children="items"
        aria-label="Выбор турнира"
        class="comp-select"
      >
        <template #value="slotProps">
          <div
            v-if="slotProps.value"
            class="comp-value"
          >
            <img
              v-if="badgeUrl(slotProps.value)"
              :src="badgeUrl(slotProps.value)"
              :class="['comp-ico', { 'comp-ico--bg': isWhiteBadge(slotProps.value) }]"
              alt=""
            >
            <span class="comp-name">{{ competitionName(slotProps.value) }}</span>
          </div>
          <span v-else>{{ slotProps.placeholder }}</span>
        </template>
        <template #option="slotProps">
          <div class="comp-value">
            <img
              v-if="badgeUrl(slotProps.option.id)"
              :src="badgeUrl(slotProps.option.id)"
              :class="['comp-ico', { 'comp-ico--bg': isWhiteBadge(slotProps.option.id) }]"
              alt=""
            >
            <span class="comp-name">{{ slotProps.option.name }}</span>
            <span class="comp-country">{{ slotProps.option.country }}</span>
          </div>
        </template>
      </Select>
    </div>

    <button
      class="burger"
      :class="{ 'burger--open': isOpen }"
      aria-label="Меню"
      @click="isOpen = !isOpen"
    >
      <span /><span /><span />
    </button>

    <div
      v-if="isOpen"
      class="mobile-nav"
    >
      <ul>
        <li><NuxtLink to="/">Результаты матчей</NuxtLink></li>
        <li><NuxtLink to="/standings">Турнирная таблица</NuxtLink></li>
        <li><NuxtLink to="/about">О проекте</NuxtLink></li>
      </ul>
    </div>
  </header>
</template>

<style scoped lang="scss">
.header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 20px;
  padding-bottom: 20px;
  margin-bottom: 16px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  color: inherit;
  flex-shrink: 0;
}

.logo__dot {
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #4ade80;
  flex-shrink: 0;
}

.logo__text {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.nav {
  display: none;
  gap: 24px;
}

.nav a {
  white-space: nowrap;
}

.header__select {
  margin-left: auto;
  flex-shrink: 1;
  min-width: 0;
}

.comp-select {
  width: 100%;
}

.comp-value {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.comp-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comp-country {
  flex-shrink: 0;
  color: #999;
  font-size: 12px;
}

.comp-ico {
  width: 18px;
  height: 18px;
  object-fit: contain;
  flex-shrink: 0;
}

.comp-ico--bg {
  background: #1f2937;
  padding: 2px;
  border-radius: 4px;
}

.burger {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  flex-shrink: 0;
}

.burger span {
  display: block;
  height: 2px;
  background: #333;
  border-radius: 2px;
  transition: transform 0.2s, opacity 0.2s;
}

.burger--open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.burger--open span:nth-child(2) { opacity: 0; }
.burger--open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

.mobile-nav {
  position: absolute;
  top: 100%;
  left: -16px;
  right: -16px;
  background: white;
  z-index: 50;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.mobile-nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.mobile-nav a {
  display: block;
  padding: 14px 24px;
  font-size: 16px;
  color: inherit;
  border-bottom: 1px solid #e5e5e5;
}

.mobile-nav a:last-child {
  border-bottom: none;
}

@media (min-width: $breakpoint-nav) {
  .nav { display: flex; }
  .burger { display: none; }
  .header__select {
    width: 195px;
  }
}

@media (min-width: $breakpoint-desktop) {
  .header__select {
    width: 235px;
  }
}
</style>
