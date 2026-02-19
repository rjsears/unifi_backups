// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// UniFi Backup Manager - DeviceCard Component Tests
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import DeviceCard from '@/components/dashboard/DeviceCard.vue'

// Mock vue-router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock notifications store
vi.mock('@/stores/notifications', () => ({
  useNotificationsStore: () => ({
    info: vi.fn(),
  }),
}))

describe('DeviceCard Component', () => {
  const mockDevice = {
    id: 1,
    name: 'UDM Pro',
    ip_address: '192.168.1.1',
    device_type: 'UDM-Pro',
    firmware_version: '3.1.16',
    is_active: true,
    last_seen: '2024-01-15T10:30:00Z',
  }

  function createWrapper(device = mockDevice) {
    return mount(DeviceCard, {
      props: { device },
      global: {
        plugins: [createPinia()],
        mocks: {
          $router: {
            push: mockPush,
          },
        },
        stubs: {
          RouterLink: true,
        },
      },
    })
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    mockPush.mockClear()
  })

  describe('rendering', () => {
    it('should render device name', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('UDM Pro')
    })

    it('should render device IP address', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('192.168.1.1')
    })

    it('should render device type', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('UDM-Pro')
    })

    it('should render firmware version with v prefix', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('v3.1.16')
    })

    it('should not render version prefix when firmware_version is empty', () => {
      const wrapper = createWrapper({ ...mockDevice, firmware_version: '' })
      expect(wrapper.text()).not.toContain(' · v')
    })
  })

  describe('status display', () => {
    it('should show Online status for active device with last_seen', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Online')
    })

    it('should show Inactive status for inactive device', () => {
      const wrapper = createWrapper({ ...mockDevice, is_active: false })
      expect(wrapper.text()).toContain('Inactive')
    })

    it('should show Unknown status for active device without last_seen', () => {
      const wrapper = createWrapper({ ...mockDevice, last_seen: null })
      expect(wrapper.text()).toContain('Unknown')
    })

    it('should apply green color for online status', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.text-green-600').exists()).toBe(true)
    })

    it('should apply gray color for inactive status', () => {
      const wrapper = createWrapper({ ...mockDevice, is_active: false })
      expect(wrapper.find('.text-gray-500').exists()).toBe(true)
    })

    it('should apply yellow color for unknown status', () => {
      const wrapper = createWrapper({ ...mockDevice, last_seen: null })
      expect(wrapper.find('.text-yellow-600').exists()).toBe(true)
    })
  })

  describe('status dot', () => {
    it('should show green dot for online device', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.bg-green-500').exists()).toBe(true)
    })

    it('should show gray dot for inactive device', () => {
      const wrapper = createWrapper({ ...mockDevice, is_active: false })
      expect(wrapper.find('.bg-gray-400').exists()).toBe(true)
    })

    it('should show yellow dot for unknown status', () => {
      const wrapper = createWrapper({ ...mockDevice, last_seen: null })
      expect(wrapper.find('.bg-yellow-500').exists()).toBe(true)
    })
  })

  describe('actions', () => {
    it('should have Backup Now button', () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('button')
      const backupButton = buttons.find((b) => b.text().includes('Backup Now'))
      expect(backupButton.exists()).toBe(true)
    })

    it('should have Review Backups button', () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('button')
      const reviewButton = buttons.find((b) => b.text().includes('Review Backups'))
      expect(reviewButton.exists()).toBe(true)
    })

    it('should navigate to backups page on Review Backups click', async () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('button')
      const reviewButton = buttons.find((b) => b.text().includes('Review Backups'))

      await reviewButton.trigger('click')

      expect(mockPush).toHaveBeenCalledWith('/backups?device=1')
    })

    it('should navigate to device detail on card click', async () => {
      const wrapper = createWrapper()

      await wrapper.trigger('click')

      expect(mockPush).toHaveBeenCalledWith('/devices/1')
    })
  })

  describe('device image', () => {
    it('should attempt to load device image based on type', () => {
      const wrapper = createWrapper()
      const img = wrapper.find('img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('/device-images/udm-pro.png')
    })

    it('should show fallback icon for unknown device type', () => {
      const wrapper = createWrapper({ ...mockDevice, device_type: 'Unknown Device' })
      // When no image mapping exists, deviceImage returns null
      const img = wrapper.find('img')
      expect(img.exists()).toBe(false)
    })

    it('should map UDM-SE to correct image', () => {
      const wrapper = createWrapper({ ...mockDevice, device_type: 'UDM-SE' })
      const img = wrapper.find('img')
      expect(img.attributes('src')).toBe('/device-images/udm-se.png')
    })

    it('should map USG to correct image', () => {
      const wrapper = createWrapper({ ...mockDevice, device_type: 'USG' })
      const img = wrapper.find('img')
      expect(img.attributes('src')).toBe('/device-images/usg.png')
    })
  })

  describe('props validation', () => {
    it('should require device prop', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.device).toBeDefined()
    })

    it('should accept device object with all properties', () => {
      const wrapper = createWrapper(mockDevice)
      expect(wrapper.vm.device.id).toBe(1)
      expect(wrapper.vm.device.name).toBe('UDM Pro')
      expect(wrapper.vm.device.ip_address).toBe('192.168.1.1')
    })
  })
})
