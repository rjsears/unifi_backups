// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// UniFi Backup Manager - TopNav Component Tests
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TopNav from '@/components/layout/TopNav.vue'

// Mock vue-router
const mockRoute = { path: '/' }
vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  RouterLink: {
    template: '<a class="router-link"><slot /></a>',
    props: ['to'],
  },
}))

// Mock auth store
const mockLogout = vi.fn()
const mockChangePassword = vi.fn()
vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    user: { username: 'testuser' },
    isAdmin: false,
    logout: mockLogout,
    changePassword: mockChangePassword,
  }),
}))

// Mock theme store
const mockToggleColorMode = vi.fn()
vi.mock('@/stores/theme', () => ({
  useThemeStore: () => ({
    isDark: false,
    colorMode: 'system',
    toggleColorMode: mockToggleColorMode,
  }),
}))

// Mock notifications store
vi.mock('@/stores/notifications', () => ({
  useNotificationsStore: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}))

describe('TopNav Component', () => {
  let pinia

  function createWrapper() {
    return mount(TopNav, {
      global: {
        plugins: [pinia],
        stubs: {
          Modal: {
            template: '<div class="modal-stub" v-if="modelValue"><slot /></div>',
            props: ['modelValue', 'title'],
          },
          HomeIcon: true,
          ServerIcon: true,
          ArchiveBoxIcon: true,
          CalendarIcon: true,
          CogIcon: true,
          SunIcon: true,
          MoonIcon: true,
          Bars3Icon: true,
          XMarkIcon: true,
          ChevronDownIcon: true,
        },
      },
      slots: {
        default: '<div class="slot-content">Page Content</div>',
      },
    })
  }

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    mockLogout.mockClear()
    mockToggleColorMode.mockClear()
    mockChangePassword.mockClear()
  })

  describe('rendering', () => {
    it('should render the logo', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('UniFi')
      expect(wrapper.text()).toContain('Backup')
    })

    it('should render navigation items', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Dashboard')
      expect(wrapper.text()).toContain('Devices')
      expect(wrapper.text()).toContain('Backups')
      expect(wrapper.text()).toContain('Schedules')
      expect(wrapper.text()).toContain('Settings')
    })

    it('should render slot content', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Page Content')
    })

    it('should have sticky header', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.sticky').exists()).toBe(true)
    })

    it('should have top-0 positioning', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.top-0').exists()).toBe(true)
    })
  })

  describe('user menu', () => {
    it('should not show user menu by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.showUserMenu).toBe(false)
    })

    it('should display user initial', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('T') // First letter of 'testuser'
    })
  })

  describe('theme toggle', () => {
    it('should call toggleColorMode when theme button clicked', async () => {
      const wrapper = createWrapper()

      // Find the theme toggle button by its title
      const themeButton = wrapper.find('[title]')
      if (themeButton.exists()) {
        await themeButton.trigger('click')
        expect(mockToggleColorMode).toHaveBeenCalled()
      }
    })
  })

  describe('navigation items', () => {
    it('should have correct number of nav items', () => {
      const wrapper = createWrapper()
      // 5 nav items: Dashboard, Devices, Backups, Schedules, Settings
      expect(wrapper.vm.navItems).toHaveLength(5)
    })

    it('should have Dashboard as first nav item', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.navItems[0].name).toBe('Dashboard')
      expect(wrapper.vm.navItems[0].to).toBe('/')
    })

    it('should have correct routes for nav items', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.navItems[1].to).toBe('/devices')
      expect(wrapper.vm.navItems[2].to).toBe('/backups')
      expect(wrapper.vm.navItems[3].to).toBe('/schedules')
      expect(wrapper.vm.navItems[4].to).toBe('/settings')
    })
  })

  describe('isActive function', () => {
    it('should return true for root path when on dashboard', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.isActive('/')).toBe(true)
    })

    it('should return false for non-matching path', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.isActive('/devices')).toBe(false)
    })
  })

  describe('mobile menu', () => {
    it('should not show mobile menu by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.mobileMenuOpen).toBe(false)
    })
  })

  describe('password modal', () => {
    it('should not show password modal by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.showPasswordModal).toBe(false)
    })

    it('should have empty password form initially', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.passwordForm.current).toBe('')
      expect(wrapper.vm.passwordForm.new).toBe('')
      expect(wrapper.vm.passwordForm.confirm).toBe('')
    })
  })

  describe('computed properties', () => {
    it('should compute userInitial correctly', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.userInitial).toBe('T')
    })

    it('should compute themeTitle', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.themeTitle).toBeDefined()
    })
  })

  describe('logout', () => {
    it('should call logout when handleLogout is called', () => {
      const wrapper = createWrapper()
      wrapper.vm.handleLogout()
      expect(mockLogout).toHaveBeenCalled()
    })

    it('should close user menu when logging out', () => {
      const wrapper = createWrapper()
      wrapper.vm.showUserMenu = true
      wrapper.vm.handleLogout()
      expect(wrapper.vm.showUserMenu).toBe(false)
    })
  })
})
