import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MatchScore from '~/components/MatchScore.vue'

describe('MatchScore', () => {
  it('отображает счёт когда голы есть', () => {
    const wrapper = mount(MatchScore, {
      props: { homeScore: '2', awayScore: '1' },
    })
    expect(wrapper.text()).toContain('2')
    expect(wrapper.text()).toContain('1')
  })

  it('показывает тире когда матч не начался', () => {
    const wrapper = mount(MatchScore, {
      props: { homeScore: null, awayScore: null },
    })
    expect(wrapper.text()).toContain('—')
  })

  it('показывает тире только для незаполненной команды', () => {
    const wrapper = mount(MatchScore, {
      props: { homeScore: '1', awayScore: null },
    })
    expect(wrapper.text()).toContain('1')
    expect(wrapper.text()).toContain('—')
  })
})
