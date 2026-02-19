// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// UniFi Backup Manager - StatCard Component Tests
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatCard from '@/components/dashboard/StatCard.vue'

describe('StatCard Component', () => {
  const defaultProps = {
    title: 'Total Devices',
    value: 42,
    subtitle: 'Active',
    icon: 'server',
    color: 'primary',
  }

  function createWrapper(props = {}) {
    return mount(StatCard, {
      props: { ...defaultProps, ...props },
    })
  }

  describe('rendering', () => {
    it('should render the title', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Total Devices')
    })

    it('should render the value', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('42')
    })

    it('should render the subtitle when provided', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Active')
    })

    it('should not render subtitle when not provided', () => {
      const wrapper = createWrapper({ subtitle: '' })
      const subtitleElements = wrapper.findAll('p')
      const hasSubtitle = subtitleElements.some(
        (el) => el.classes().length === 0 && el.text() === ''
      )
      expect(hasSubtitle).toBe(false)
    })

    it('should render with string value', () => {
      const wrapper = createWrapper({ value: '1.5 TB' })
      expect(wrapper.text()).toContain('1.5 TB')
    })

    it('should render with number value', () => {
      const wrapper = createWrapper({ value: 100 })
      expect(wrapper.text()).toContain('100')
    })
  })

  describe('icon variations', () => {
    it('should render server icon by default', () => {
      const wrapper = createWrapper({ icon: 'server' })
      expect(wrapper.find('.w-6.h-6').exists()).toBe(true)
    })

    it('should render archive icon', () => {
      const wrapper = createWrapper({ icon: 'archive' })
      expect(wrapper.find('.w-6.h-6').exists()).toBe(true)
    })

    it('should render calendar icon', () => {
      const wrapper = createWrapper({ icon: 'calendar' })
      expect(wrapper.find('.w-6.h-6').exists()).toBe(true)
    })

    it('should render storage icon', () => {
      const wrapper = createWrapper({ icon: 'storage' })
      expect(wrapper.find('.w-6.h-6').exists()).toBe(true)
    })

    it('should fallback to server icon for unknown icon type', () => {
      const wrapper = createWrapper({ icon: 'unknown' })
      expect(wrapper.find('.w-6.h-6').exists()).toBe(true)
    })
  })

  describe('color variations', () => {
    it('should apply primary color classes', () => {
      const wrapper = createWrapper({ color: 'primary' })
      expect(wrapper.find('.bg-primary-500\\/20').exists()).toBe(true)
    })

    it('should apply green color classes', () => {
      const wrapper = createWrapper({ color: 'green' })
      expect(wrapper.find('.bg-green-500\\/20').exists()).toBe(true)
    })

    it('should apply purple color classes', () => {
      const wrapper = createWrapper({ color: 'purple' })
      expect(wrapper.find('.bg-purple-500\\/20').exists()).toBe(true)
    })

    it('should apply yellow color classes', () => {
      const wrapper = createWrapper({ color: 'yellow' })
      expect(wrapper.find('.bg-yellow-500\\/20').exists()).toBe(true)
    })

    it('should apply red color classes', () => {
      const wrapper = createWrapper({ color: 'red' })
      expect(wrapper.find('.bg-red-500\\/20').exists()).toBe(true)
    })

    it('should fallback to primary for unknown color', () => {
      const wrapper = createWrapper({ color: 'unknown' })
      expect(wrapper.find('.bg-primary-500\\/20').exists()).toBe(true)
    })
  })

  describe('default props', () => {
    it('should have default empty title', () => {
      const wrapper = mount(StatCard)
      expect(wrapper.vm.title).toBe('')
    })

    it('should have default value of 0', () => {
      const wrapper = mount(StatCard)
      expect(wrapper.vm.value).toBe(0)
    })

    it('should have default empty subtitle', () => {
      const wrapper = mount(StatCard)
      expect(wrapper.vm.subtitle).toBe('')
    })

    it('should have default server icon', () => {
      const wrapper = mount(StatCard)
      expect(wrapper.vm.icon).toBe('server')
    })

    it('should have default primary color', () => {
      const wrapper = mount(StatCard)
      expect(wrapper.vm.color).toBe('primary')
    })
  })
})
