<template>
  <header class="container">
    <NuxtLink
        to="/"
        class="logo"
    >
      <span class="logo__text">MatchResults</span>
    </NuxtLink>
    <ul class="nav">
      <li>
        <NuxtLink to="/">
          Главные события
        </NuxtLink>
      </li>
      <li>
        <NuxtLink to="/about">
          О проекте
        </NuxtLink>
      </li>
    </ul>
  </header>
</template>

<style scoped>
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  padding-bottom: 16px;
  margin-bottom: 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: inherit;
}

.logo__text {
  background-color: #4ade80;
  color: white;
  font-size: 16px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 8px;
}

.nav {
  display: flex;
  gap: 24px;
}

.nav a {
  white-space: nowrap;
}

@media (max-width: 480px) {
  .nav {
    gap: 12px;
    font-size: 14px;
  }
}
</style>