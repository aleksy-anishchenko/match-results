<script
    setup
    lang="ts"
>
defineProps<{
  name: string
  badge: string
  side: 'left' | 'right'
}>()
</script>

<template>
  <div :class="['team', side === 'left' ? 'team--left' : 'team--right']">
    <template v-if="side === 'left'">
      <div class="team__name">{{ name }}</div>
      <img
          :src="badge"
          width="30"
          height="30"
          :alt="name"
      />
    </template>
    <template v-else>
      <img
          :src="badge"
          width="30"
          height="30"
          :alt="name"
      />
      <div class="team__name">{{ name }}</div>
    </template>
  </div>
</template>

<style scoped>
.team {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.team--left {
  justify-content: flex-end;
  text-align: right;
  padding-right: 12px;
}

.team--right {
  justify-content: flex-start;
  text-align: left;
  padding-left: 12px;
}

.team__name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

@media (max-width: 480px) {
  .team__name {
    font-size: 13px;
  }
}
</style>
