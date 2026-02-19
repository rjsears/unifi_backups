// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// UniFi Backup Manager - Notifications Component Tests
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Notifications from '@/components/ui/Notifications.vue'
import { useNotificationsStore } from '@/stores/notifications'

describe('Notifications Component', () => {
  let notificationsStore
  let pinia

  function createWrapper() {
    return mount(Notifications, {
      global: {
        plugins: [pinia],
      },
      attachTo: document.body,
    })
  }

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    notificationsStore = useNotificationsStore()
    document.body.innerHTML = ''
  })

  describe('rendering', () => {
    it('should render nothing when no notifications', () => {
      const wrapper = createWrapper()
      expect(wrapper.findAll('[role="alert"]').length).toBe(0)
    })

    it('should render notification when added to store', async () => {
      const wrapper = createWrapper()

      notificationsStore.add({
        type: 'info',
        title: 'Test Title',
        message: 'Test Message',
        duration: 0,
      })

      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Test Title')
      expect(wrapper.text()).toContain('Test Message')
    })

    it('should render multiple notifications', async () => {
      const wrapper = createWrapper()

      notificationsStore.add({ title: 'First', duration: 0 })
      notificationsStore.add({ title: 'Second', duration: 0 })
      notificationsStore.add({ title: 'Third', duration: 0 })

      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('First')
      expect(wrapper.text()).toContain('Second')
      expect(wrapper.text()).toContain('Third')
    })
  })

  describe('notification types', () => {
    it('should render success notification with green styling', async () => {
      const wrapper = createWrapper()

      notificationsStore.success('Success', 'Operation completed')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.text-green-500').exists()).toBe(true)
      expect(wrapper.find('.border-l-green-500').exists()).toBe(true)
    })

    it('should render error notification with red styling', async () => {
      const wrapper = createWrapper()

      notificationsStore.error('Error', 'Something failed')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.text-red-500').exists()).toBe(true)
      expect(wrapper.find('.border-l-red-500').exists()).toBe(true)
    })

    it('should render warning notification with yellow styling', async () => {
      const wrapper = createWrapper()

      notificationsStore.warning('Warning', 'Be careful')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.text-yellow-500').exists()).toBe(true)
      expect(wrapper.find('.border-l-yellow-500').exists()).toBe(true)
    })

    it('should render info notification with blue styling', async () => {
      const wrapper = createWrapper()

      notificationsStore.info('Info', 'FYI')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.text-blue-500').exists()).toBe(true)
      expect(wrapper.find('.border-l-blue-500').exists()).toBe(true)
    })
  })

  describe('dismiss functionality', () => {
    it('should remove notification when dismiss button clicked', async () => {
      const wrapper = createWrapper()

      notificationsStore.add({ title: 'Dismissable', duration: 0 })
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Dismissable')

      const dismissButton = wrapper.find('button')
      await dismissButton.trigger('click')

      await wrapper.vm.$nextTick()
      expect(wrapper.text()).not.toContain('Dismissable')
    })

    it('should only dismiss the clicked notification', async () => {
      const wrapper = createWrapper()

      notificationsStore.add({ title: 'First', duration: 0 })
      notificationsStore.add({ title: 'Second', duration: 0 })
      await wrapper.vm.$nextTick()

      const dismissButtons = wrapper.findAll('button')
      await dismissButtons[0].trigger('click')

      await wrapper.vm.$nextTick()
      expect(wrapper.text()).not.toContain('First')
      expect(wrapper.text()).toContain('Second')
    })
  })

  describe('positioning', () => {
    it('should be fixed positioned at top right', () => {
      createWrapper()
      // The component teleports to body, so check the teleported content
      const container = document.querySelector('.fixed.top-4.right-4')
      expect(container).toBeTruthy()
    })

    it('should have high z-index', () => {
      createWrapper()
      const container = document.querySelector('.z-50')
      expect(container).toBeTruthy()
    })
  })

  describe('icons', () => {
    it('should display check icon for success', async () => {
      const wrapper = createWrapper()

      notificationsStore.success('Success', 'Done')
      await wrapper.vm.$nextTick()

      // The component uses CheckCircleIcon for success with text-green-500 class
      expect(wrapper.find('.text-green-500').exists()).toBe(true)
    })

    it('should display x-circle icon for error', async () => {
      const wrapper = createWrapper()

      notificationsStore.error('Error', 'Failed')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.text-red-500').exists()).toBe(true)
    })
  })
})
