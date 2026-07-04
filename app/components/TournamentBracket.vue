<script setup lang="ts">
import type { BracketRound } from '~/types'

const props = defineProps<{ rounds: BracketRound[] }>()

// Layout constants — CARD_H must match the CSS height value
const CARD_H = 50
const CARD_W = 148
const CARD_GAP = 6   // gap between first-round cards
const CONN_W = 16    // width of connector column between rounds
const UNIT = CARD_H + CARD_GAP

const firstCount = computed(() => props.rounds[0]?.matches.length ?? 0)
const totalH = computed(() => firstCount.value * UNIT - CARD_GAP)
const totalW = computed(() => props.rounds.length * CARD_W + Math.max(0, props.rounds.length - 1) * CONN_W)

function matchTop(ri: number, mi: number): number {
  const step = 2 ** ri
  return ((step - 1) / 2 + mi * step) * UNIT
}

function colLeft(ri: number): number {
  return ri * (CARD_W + CONN_W)
}

function connPath(ri: number, nextCount: number): string {
  const cx = CONN_W / 2
  return Array.from({ length: nextCount }, (_, k) => {
    const y1 = matchTop(ri, 2 * k) + CARD_H / 2
    const y2 = matchTop(ri, 2 * k + 1) + CARD_H / 2
    const ym = (y1 + y2) / 2
    return `M0,${y1}H${cx}V${y2}H0M${cx},${ym}H${CONN_W}`
  }).join(' ')
}

const DONE = new Set(['FT', 'AET', 'AP'])

type Match = BracketRound['matches'][number]

function result(m: Match): 'home' | 'away' | null {
  if (!DONE.has(m.status)) return null
  const h = Number(m.homeScore ?? 0)
  const a = Number(m.awayScore ?? 0)
  if (h > a) return 'home'
  if (a > h) return 'away'
  if (m.status === 'AP') {
    const hp = m.homePenScore ?? 0
    const ap = m.awayPenScore ?? 0
    if (hp > ap) return 'home'
    if (ap > hp) return 'away'
  }
  return null
}

const liveMap: Record<string, string> = {
  '1H': '1T', HT: 'Пер.', '2H': '2T', ET: 'ДВ', PEN: 'Пен.',
}
</script>

<template>
  <div v-if="rounds.length" class="bs">
    <!-- Round name headers -->
    <div class="bs-header" :style="{ width: totalW + 'px' }">
      <template v-for="(round, ri) in rounds" :key="ri">
        <div class="bs-title" :style="{ width: CARD_W + 'px' }">
          {{ round.name }}
        </div>
        <div v-if="ri < rounds.length - 1" :style="{ width: CONN_W + 'px', flexShrink: 0 }" />
      </template>
    </div>

    <!-- Bracket body -->
    <div class="bs-body" :style="{ width: totalW + 'px', height: totalH + 'px' }">

      <!-- Match card columns -->
      <div
        v-for="(round, ri) in rounds"
        :key="'col-' + ri"
        class="bs-col"
        :style="{ left: colLeft(ri) + 'px', width: CARD_W + 'px' }"
      >
        <div
          v-for="(match, mi) in round.matches"
          :key="match.idEvent"
          class="mc"
          :class="{ 'mc--proj': round.projected, 'mc--done': DONE.has(match.status) }"
          :style="{ top: matchTop(ri, mi) + 'px' }"
        >
          <!-- Home team row -->
          <div
            class="mc-team"
            :class="{
              'mc-team--win': result(match) === 'home',
              'mc-team--lose': result(match) === 'away',
              'mc-team--tbd': !match.homeTeam,
            }"
          >
            <img
              v-if="match.homeBadge"
              :src="`/api/image?url=${encodeURIComponent(match.homeBadge)}`"
              width="16" height="16" class="mc-badge"
              :alt="match.homeTeam"
            />
            <span class="mc-name">{{ getTeamName(match.homeTeam) || 'Не определен' }}</span>
            <span v-if="DONE.has(match.status) && match.homeScore !== null" class="mc-score">
              {{ match.homeScore }}<sup v-if="match.homePenScore != null" class="mc-pen">{{ match.homePenScore }}</sup>
            </span>
          </div>

          <div class="mc-sep" />

          <!-- Away team row -->
          <div
            class="mc-team"
            :class="{
              'mc-team--win': result(match) === 'away',
              'mc-team--lose': result(match) === 'home',
              'mc-team--tbd': !match.awayTeam,
            }"
          >
            <img
              v-if="match.awayBadge"
              :src="`/api/image?url=${encodeURIComponent(match.awayBadge)}`"
              width="16" height="16" class="mc-badge"
              :alt="match.awayTeam"
            />
            <span class="mc-name">{{ getTeamName(match.awayTeam) || 'Не определен' }}</span>
            <span v-if="DONE.has(match.status) && match.awayScore !== null" class="mc-score">
              {{ match.awayScore }}<sup v-if="match.awayPenScore != null" class="mc-pen">{{ match.awayPenScore }}</sup>
            </span>
          </div>
        </div>
      </div>

      <!-- SVG connectors between rounds -->
      <template v-for="(_, ri) in rounds" :key="'conn-' + ri">
        <svg
          v-if="ri < rounds.length - 1"
          class="bs-conn"
          :style="{ left: colLeft(ri) + CARD_W + 'px' }"
          :width="CONN_W"
          :height="totalH"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            :d="connPath(ri, rounds[ri + 1]!.matches.length)"
            stroke="#c8c8c8"
            stroke-width="1.5"
            fill="none"
          />
        </svg>
      </template>

    </div>
  </div>
</template>

<style scoped lang="scss">
.bs {
  overflow-x: auto;
  overflow-y: auto;
  padding-bottom: 40px;
  -webkit-overflow-scrolling: touch;
}

.bs-header {
  display: flex;
  padding-bottom: 10px;
}

.bs-title {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}


.bs-body {
  position: relative;
}

.bs-col {
  position: absolute;
  top: 0;
}

.bs-conn {
  position: absolute;
  top: 0;
  overflow: visible;
}

.mc {
  position: absolute;
  width: 100%;
  height: 50px; /* must match CARD_H constant in script */
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  background: #fff;
  padding: 5px 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
}

.mc--proj {
  border-style: dashed;
  border-color: #e0e0e0;
  background: #fafafa;
}

.mc--done {
  background: #f9f9f9;
}

.mc-team {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  min-width: 0;
}

.mc-team--win .mc-name {
  font-weight: 700;
}

.mc-team--lose {
  opacity: 0.38;
}

.mc-team--tbd .mc-name {
  color: #ccc;
  font-style: italic;
}

.mc-badge {
  flex-shrink: 0;
  object-fit: contain;
}


.mc-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.mc-score {
  font-weight: 700;
  font-size: 13px;
  min-width: 12px;
  text-align: right;
  flex-shrink: 0;
}

.mc-pen {
  font-size: 9px;
  font-weight: 500;
  color: #888;
  vertical-align: super;
}

.mc-live {
  font-size: 10px;
  font-weight: 600;
  color: #16a34a;
  flex-shrink: 0;
}

.mc-sep {
  height: 1px;
  background: #f0f0f0;
  margin: 0 -8px;
}
</style>
