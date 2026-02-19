// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// UniFi Backup Manager - BackupsView Tests
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BackupsView from '@/views/BackupsView.vue'

describe('BackupsView', () => {
  function createWrapper() {
    return mount(BackupsView, {
      global: {
        stubs: {
          ArchiveBoxIcon: true,
        },
      },
    })
  }

  describe('rendering', () => {
    it('should render the page header', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Backups')
    })

    it('should render the subtitle', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Browse and manage your device backups')
    })

    it('should show placeholder message', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Backups View')
      expect(wrapper.text()).toContain('Phase 3 & 4')
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

    it('should have h1 with text-2xl', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('h1.text-2xl').exists()).toBe(true)
    })
  })
})
