<script setup lang="ts">
const props = defineProps<{
  name: string
  badge: string
  side: 'left' | 'right'
}>()

const badgeUrl = computed(() =>
  props.badge ? `/api/image?url=${encodeURIComponent(props.badge)}` : ''
)

const localName = computed(() => getTeamName(props.name))
</script>

<template>
  <div :class="['team', `team--${side}`]">
    <img
        :src="badgeUrl"
        width="30"
        height="30"
        :alt="name"
    />
    <div class="team__name">{{ localName }}</div>
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
  flex-direction: row-reverse;
  justify-content: flex-start;
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
