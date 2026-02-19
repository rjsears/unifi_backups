// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// UniFi Backup Manager - SettingsView Tests
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SettingsView from '@/views/SettingsView.vue'

describe('SettingsView', () => {
  function createWrapper() {
    return mount(SettingsView, {
      global: {
        stubs: {
          CogIcon: true,
        },
      },
    })
  }

  describe('rendering', () => {
    it('should render the page header', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Settings')
    })

    it('should render the subtitle', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Configure system settings and storage')
    })

    it('should show placeholder message', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Settings View')
      expect(wrapper.text()).toContain('Phase 6')
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

    it('should have p-12 padding on card', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.p-12').exists()).toBe(true)
    })
  })
})
