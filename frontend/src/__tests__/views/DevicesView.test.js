// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// UniFi Backup Manager - DevicesView Tests
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import DevicesView from '@/views/DevicesView.vue'

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

// Mock notifications store
const mockSuccess = vi.fn()
const mockError = vi.fn()
vi.mock('@/stores/notifications', () => ({
  useNotificationsStore: () => ({
    success: mockSuccess,
    error: mockError,
    info: vi.fn(),
  }),
}))

describe('DevicesView', () => {
  let pinia

  function createWrapper() {
    return mount(DevicesView, {
      global: {
        plugins: [pinia],
        stubs: {
          Modal: {
            template: '<div class="modal-stub" v-if="modelValue"><slot /></div>',
            props: ['modelValue', 'title', 'size'],
          },
          DeviceCard: {
            template: '<div class="device-card-stub">{{ device.name }}</div>',
            props: ['device'],
          },
          ServerIcon: true,
          PlusIcon: true,
        },
      },
    })
  }

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    mockSuccess.mockClear()
    mockError.mockClear()
  })

  describe('rendering', () => {
    it('should render the page header', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Devices')
      expect(wrapper.text()).toContain('Manage your UniFi devices')
    })

    it('should render Add Device button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Add Device')
    })

    it('should show empty state when no devices', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.text()).toContain('No devices configured')
      expect(wrapper.text()).toContain('Add your first UniFi device')
    })

    it('should have Add Your First Device button in empty state', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.text()).toContain('Add Your First Device')
    })
  })

  describe('loading state', () => {
    it('should have loading property', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm).toHaveProperty('loading')
    })

    it('should stop loading after data loads', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.vm.loading).toBe(false)
    })
  })

  describe('add device modal', () => {
    it('should not show modal by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.showAddModal).toBe(false)
    })

    it('should open modal when Add Device button clicked', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const addButton = wrapper.findAll('button').find((b) => b.text().includes('Add Device'))
      await addButton.trigger('click')

      expect(wrapper.vm.showAddModal).toBe(true)
    })

    it('should have empty new device form initially', () => {
      const wrapper = createWrapper()

      expect(wrapper.vm.newDevice.name).toBe('')
      expect(wrapper.vm.newDevice.ip_address).toBe('')
      expect(wrapper.vm.newDevice.device_type).toBe('')
      expect(wrapper.vm.newDevice.api_key).toBe('')
    })
  })

  describe('add device form', () => {
    it('should show modal with form fields', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      wrapper.vm.showAddModal = true
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.modal-stub').exists()).toBe(true)
    })

    it('should have addingDevice state', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.addingDevice).toBe(false)
    })
  })

  describe('handleAddDevice', () => {
    it('should show success notification after adding device', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      wrapper.vm.showAddModal = true
      wrapper.vm.newDevice = {
        name: 'Test Device',
        ip_address: '192.168.1.1',
        device_type: 'UDM-Pro',
        api_key: 'test-key',
      }

      await wrapper.vm.handleAddDevice()

      expect(mockSuccess).toHaveBeenCalledWith('Success', 'Device added successfully')
    })

    it('should close modal after adding device', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      wrapper.vm.showAddModal = true
      await wrapper.vm.handleAddDevice()

      expect(wrapper.vm.showAddModal).toBe(false)
    })

    it('should reset form after adding device', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      wrapper.vm.newDevice = {
        name: 'Test',
        ip_address: '192.168.1.1',
        device_type: 'UDM-Pro',
        api_key: 'key',
      }

      await wrapper.vm.handleAddDevice()

      expect(wrapper.vm.newDevice.name).toBe('')
      expect(wrapper.vm.newDevice.ip_address).toBe('')
    })
  })

  describe('loadDevices', () => {
    it('should be a callable function', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.loadDevices).toBe('function')
    })

    it('should set loading to false after completion', async () => {
      const wrapper = createWrapper()

      await wrapper.vm.loadDevices()

      expect(wrapper.vm.loading).toBe(false)
    })
  })
})
