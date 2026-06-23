<script setup lang="ts">
const isOpen = ref(false)
const route = useRoute()

watch(route, () => { isOpen.value = false })
</script>

<template>
  <header class="header container">
    <NuxtLink to="/" class="logo">
      <span class="logo__dot" />
      <span class="logo__text">MatchResults</span>
    </NuxtLink>

    <ul class="nav">
      <li><NuxtLink to="/">Результаты</NuxtLink></li>
      <li><NuxtLink to="/standings">Таблица</NuxtLink></li>
      <li><NuxtLink to="/about">О проекте</NuxtLink></li>
    </ul>

    <button class="burger" :class="{ 'burger--open': isOpen }" @click="isOpen = !isOpen" aria-label="Меню">
      <span /><span /><span />
    </button>

    <div v-if="isOpen" class="mobile-nav">
      <ul>
        <li><NuxtLink to="/">Результаты</NuxtLink></li>
        <li><NuxtLink to="/standings">Таблица</NuxtLink></li>
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
  padding-top: 20px;
  padding-bottom: 20px;
  margin-bottom: 16px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  color: inherit;
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
  margin-left: auto;
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

@media (min-width: $breakpoint-desktop) {
  .nav { display: flex; }
  .burger { display: none; }
}
</style>
