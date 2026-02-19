// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// UniFi Backup Manager - SchedulesView Tests
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SchedulesView from '@/views/SchedulesView.vue'

describe('SchedulesView', () => {
  function createWrapper() {
    return mount(SchedulesView, {
      global: {
        stubs: {
          CalendarIcon: true,
        },
      },
    })
  }

  describe('rendering', () => {
    it('should render the page header', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Schedules')
    })

    it('should render the subtitle', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Configure automated backup schedules')
    })

    it('should show placeholder message', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Schedules View')
      expect(wrapper.text()).toContain('Phase 5')
    })

    it('should have card styling', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.card').exists()).toBe(true)
    })

    it('should have text-center class on card', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.text-center').exists()).toBe(true)
    })
  })

  describe('structure', () => {
    it('should have main container div', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('should have header section with mb-8', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.mb-8').exists()).toBe(true)
    })

    it('should have h1 element', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('h1').exists()).toBe(true)
    })

    it('should have paragraph description', () => {
      const wrapper = createWrapper()
      expect(wrapper.findAll('p').length).toBeGreaterThan(0)
    })
  })
})
