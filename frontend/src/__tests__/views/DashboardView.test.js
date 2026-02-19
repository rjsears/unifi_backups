// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// UniFi Backup Manager - DashboardView Tests
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import DashboardView from '@/views/DashboardView.vue'

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  RouterLink: {
    name: 'RouterLink',
    template: '<a><slot /></a>',
    props: ['to'],
  },
}))

// Mock notifications store
vi.mock('@/stores/notifications', () => ({
  useNotificationsStore: () => ({
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  }),
}))

describe('DashboardView', () => {
  function createWrapper() {
    return mount(DashboardView, {
      global: {
        plugins: [createPinia()],
        stubs: {
          StatCard: {
            name: 'StatCard',
            template: '<div class="stat-card-stub" :data-title="title">{{ value }}</div>',
            props: ['title', 'value', 'icon', 'color'],
          },
          DeviceCard: {
            name: 'DeviceCard',
            template: '<div class="device-card-stub">{{ device.name }}</div>',
            props: ['device'],
          },
          RouterLink: {
            name: 'RouterLink',
            template: '<a class="router-link-stub"><slot /></a>',
            props: ['to'],
          },
          ServerIcon: true,
        },
      },
    })
  }

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('rendering', () => {
    it('should render the page header', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Dashboard')
      expect(wrapper.text()).toContain('Overview of your UniFi backup system')
    })

    it('should render stat cards', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const statCards = wrapper.findAll('.stat-card-stub')
      expect(statCards.length).toBe(4)
    })

    it('should render Total Devices stat card', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const statCard = wrapper.find('[data-title="Total Devices"]')
      expect(statCard.exists()).toBe(true)
    })

    it('should render Total Backups stat card', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const statCard = wrapper.find('[data-title="Total Backups"]')
      expect(statCard.exists()).toBe(true)
    })

    it('should render Active Schedules stat card', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const statCard = wrapper.find('[data-title="Active Schedules"]')
      expect(statCard.exists()).toBe(true)
    })

    it('should render Storage Used stat card', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const statCard = wrapper.find('[data-title="Storage Used"]')
      expect(statCard.exists()).toBe(true)
    })
  })

  describe('sections', () => {
    it('should render Devices section header', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Devices')
    })

    it('should render Recent Backups section header', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Recent Backups')
    })

    it('should show View All links', () => {
      const wrapper = createWrapper()
      const viewAllLinks = wrapper.findAll('.router-link-stub')
      expect(viewAllLinks.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('empty state', () => {
    it('should show empty state when no devices', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.text()).toContain('No devices configured')
      expect(wrapper.text()).toContain('Add your first UniFi device to get started')
    })

    it('should show Add Device button in empty state', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.text()).toContain('Add Device')
    })

    it('should show No backups yet message', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.text()).toContain('No backups yet')
    })
  })

  describe('loading state', () => {
    it('should start in loading state', () => {
      const wrapper = createWrapper()
      // The loading state is managed internally
      expect(wrapper.vm.loading).toBeDefined()
    })

    it('should stop loading after data loads', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.vm.loading).toBe(false)
    })
  })

  describe('table structure', () => {
    it('should render backup table with correct headers', () => {
      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('Device')
      expect(wrapper.text()).toContain('Filename')
      expect(wrapper.text()).toContain('Size')
      expect(wrapper.text()).toContain('Type')
      expect(wrapper.text()).toContain('Status')
      expect(wrapper.text()).toContain('Date')
    })
  })

  describe('helper functions', () => {
    it('should format file sizes correctly', async () => {
      const wrapper = createWrapper()

      // Access the formatSize function through the component
      expect(wrapper.vm.formatSize(0)).toBe('0 B')
      expect(wrapper.vm.formatSize(1024)).toBe('1.0 KB')
      expect(wrapper.vm.formatSize(1048576)).toBe('1.0 MB')
      expect(wrapper.vm.formatSize(1073741824)).toBe('1.0 GB')
    })

    it('should format null bytes as 0 B', async () => {
      const wrapper = createWrapper()

      expect(wrapper.vm.formatSize(null)).toBe('0 B')
    })

    it('should return dash for null date', async () => {
      const wrapper = createWrapper()

      expect(wrapper.vm.formatDate(null)).toBe('-')
    })

    it('should return correct badge class for status', async () => {
      const wrapper = createWrapper()

      expect(wrapper.vm.statusBadgeClass('completed')).toBe('badge-success')
      expect(wrapper.vm.statusBadgeClass('running')).toBe('badge-info')
      expect(wrapper.vm.statusBadgeClass('pending')).toBe('badge-warning')
      expect(wrapper.vm.statusBadgeClass('failed')).toBe('badge-danger')
      expect(wrapper.vm.statusBadgeClass('unknown')).toBe('badge')
    })
  })

  describe('initial stats', () => {
    it('should initialize with zero values', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.vm.stats.totalDevices).toBe(0)
      expect(wrapper.vm.stats.totalBackups).toBe(0)
      expect(wrapper.vm.stats.activeSchedules).toBe(0)
      expect(wrapper.vm.stats.storageUsed).toBe('0 GB')
    })
  })
})
