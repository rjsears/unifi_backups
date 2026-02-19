// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// UniFi Backup Manager - Notifications Component Tests
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Notifications from '@/components/ui/Notifications.vue'
import { useNotificationsStore } from '@/stores/notifications'

describe('Notifications Component', () => {
  let pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    document.body.innerHTML = ''
  })

  describe('component structure', () => {
    it('should mount without errors', () => {
      const wrapper = mount(Notifications, {
        global: {
          plugins: [pinia],
        },
        attachTo: document.body,
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('should teleport content to body', () => {
      mount(Notifications, {
        global: {
          plugins: [pinia],
        },
        attachTo: document.body,
      })
      // Check that the teleported container exists
      const container = document.querySelector('.fixed')
      expect(container).toBeTruthy()
    })

    it('should have correct positioning classes', () => {
      mount(Notifications, {
        global: {
          plugins: [pinia],
        },
        attachTo: document.body,
      })
      const container = document.querySelector('.top-4.right-4')
      expect(container).toBeTruthy()
    })

    it('should have z-50 for proper stacking', () => {
      mount(Notifications, {
        global: {
          plugins: [pinia],
        },
        attachTo: document.body,
      })
      const container = document.querySelector('.z-50')
      expect(container).toBeTruthy()
    })
  })

  describe('store integration', () => {
    it('should use notifications store', () => {
      const store = useNotificationsStore()
      expect(store).toBeDefined()
      expect(store.notifications).toEqual([])
    })

    it('should be able to add notifications to store', () => {
      const store = useNotificationsStore()
      vi.useFakeTimers()

      store.add({ title: 'Test', message: 'Message', duration: 0 })

      expect(store.notifications).toHaveLength(1)
      expect(store.notifications[0].title).toBe('Test')

      vi.useRealTimers()
    })

    it('should be able to remove notifications from store', () => {
      const store = useNotificationsStore()
      vi.useFakeTimers()

      const id = store.add({ title: 'Test', duration: 0 })
      expect(store.notifications).toHaveLength(1)

      store.remove(id)
      expect(store.notifications).toHaveLength(0)

      vi.useRealTimers()
    })
  })

  describe('notification types in store', () => {
    it('should support success type', () => {
      const store = useNotificationsStore()
      vi.useFakeTimers()

      store.success('Success', 'Done')

      expect(store.notifications[0].type).toBe('success')

      vi.useRealTimers()
    })

    it('should support error type', () => {
      const store = useNotificationsStore()
      vi.useFakeTimers()

      store.error('Error', 'Failed')

      expect(store.notifications[0].type).toBe('error')

      vi.useRealTimers()
    })

    it('should support warning type', () => {
      const store = useNotificationsStore()
      vi.useFakeTimers()

      store.warning('Warning', 'Caution')

      expect(store.notifications[0].type).toBe('warning')

      vi.useRealTimers()
    })

    it('should support info type', () => {
      const store = useNotificationsStore()
      vi.useFakeTimers()

      store.info('Info', 'FYI')

      expect(store.notifications[0].type).toBe('info')

      vi.useRealTimers()
    })
  })
})
