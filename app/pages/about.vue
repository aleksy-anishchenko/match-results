<script setup lang="ts">
useHead({ title: 'О проекте' })
</script>

<template>
  <div class="about">
    <h1 class="about__title">О проекте</h1>
    <p class="about__text">
      Сайт для тех, кто хочет просто следить за футболом. Результаты матчей, турнирные таблицы, статистика и расписание — без лишнего шума. Никаких новостей о том, что запостила жена футболиста, кто с кем поссорился в раздевалке и какого молодого российского игрока сегодня снова хотят купить Манчестер Юнайтед, ПСЖ или Реал.
    </p>

    <div class="about__dedication">
      <img
          src="/images/barsik.jpg"
          alt="Барсик"
          class="about__cat"
      />
      <p class="about__dedication-text">
        Этот сайт посвящается моему коту Барсику, которого я очень любил.
      </p>
    </div>
  </div>
</template>

<style scoped>
.about__title {
  font-size: 26px;
  font-weight: bold;
  margin-bottom: 20px;
}

.about__text {
  font-size: 16px;
  line-height: 1.7;
  color: #444;
  margin-bottom: 48px;
}

.about__dedication {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
  text-align: center;
}

.about__cat {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 50%;
}

.about__dedication-text {
  font-size: 15px;
  color: #777;
  font-style: italic;
}

@media (max-width: 600px) {
  .about__dedication {
    align-items: center;
  }
}
</style>
