// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// UniFi Backup Manager - Notifications Store Tests
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotificationsStore } from '@/stores/notifications'

describe('Notifications Store', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useNotificationsStore()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('add', () => {
    it('should add a notification', () => {
      store.add({ title: 'Test', message: 'Test message' })

      expect(store.notifications).toHaveLength(1)
      expect(store.notifications[0].title).toBe('Test')
      expect(store.notifications[0].message).toBe('Test message')
    })

    it('should return notification id', () => {
      const id = store.add({ title: 'Test', message: 'Test message' })

      expect(typeof id).toBe('number')
    })

    it('should auto-increment ids', () => {
      const id1 = store.add({ title: 'Test 1' })
      const id2 = store.add({ title: 'Test 2' })

      expect(id2).toBe(id1 + 1)
    })

    it('should set default type to info', () => {
      store.add({ title: 'Test' })

      expect(store.notifications[0].type).toBe('info')
    })

    it('should set default duration to 5000ms', () => {
      store.add({ title: 'Test' })

      expect(store.notifications[0].duration).toBe(5000)
    })

    it('should auto-remove after duration', () => {
      store.add({ title: 'Test', duration: 1000 })

      expect(store.notifications).toHaveLength(1)

      vi.advanceTimersByTime(1000)

      expect(store.notifications).toHaveLength(0)
    })

    it('should not auto-remove if duration is 0', () => {
      store.add({ title: 'Test', duration: 0 })

      vi.advanceTimersByTime(10000)

      expect(store.notifications).toHaveLength(1)
    })
  })

  describe('remove', () => {
    it('should remove notification by id', () => {
      const id = store.add({ title: 'Test' })

      store.remove(id)

      expect(store.notifications).toHaveLength(0)
    })

    it('should not throw if id does not exist', () => {
      expect(() => store.remove(999)).not.toThrow()
    })

    it('should only remove specified notification', () => {
      store.add({ title: 'Test 1' })
      const id2 = store.add({ title: 'Test 2' })
      store.add({ title: 'Test 3' })

      store.remove(id2)

      expect(store.notifications).toHaveLength(2)
      expect(store.notifications.find(n => n.title === 'Test 2')).toBeUndefined()
    })
  })

  describe('success', () => {
    it('should add success notification', () => {
      store.success('Success!', 'It worked')

      expect(store.notifications[0].type).toBe('success')
      expect(store.notifications[0].title).toBe('Success!')
      expect(store.notifications[0].message).toBe('It worked')
    })
  })

  describe('error', () => {
    it('should add error notification', () => {
      store.error('Error!', 'Something went wrong')

      expect(store.notifications[0].type).toBe('error')
      expect(store.notifications[0].title).toBe('Error!')
    })

    it('should have longer duration for errors (8000ms)', () => {
      store.error('Error!', 'Something went wrong')

      expect(store.notifications[0].duration).toBe(8000)
    })
  })

  describe('warning', () => {
    it('should add warning notification', () => {
      store.warning('Warning!', 'Be careful')

      expect(store.notifications[0].type).toBe('warning')
      expect(store.notifications[0].title).toBe('Warning!')
    })
  })

  describe('info', () => {
    it('should add info notification', () => {
      store.info('Info', 'FYI')

      expect(store.notifications[0].type).toBe('info')
      expect(store.notifications[0].title).toBe('Info')
    })
  })

  describe('clear', () => {
    it('should remove all notifications', () => {
      store.add({ title: 'Test 1' })
      store.add({ title: 'Test 2' })
      store.add({ title: 'Test 3' })

      store.clear()

      expect(store.notifications).toHaveLength(0)
    })
  })
})
