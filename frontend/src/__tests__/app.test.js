// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// UniFi Backup Manager - App Tests
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import App from '@/App.vue'

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useRoute: () => ({
    path: '/',
  }),
  RouterView: {
    name: 'RouterView',
    template: '<div class="router-view-stub"><slot /></div>',
  },
  RouterLink: {
    name: 'RouterLink',
    template: '<a><slot /></a>',
    props: ['to'],
  },
}))

// Mock stores
const mockCheckAuth = vi.fn()
const mockThemeInit = vi.fn()
let mockIsAuthenticated = false

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    isAuthenticated: mockIsAuthenticated,
    checkAuth: mockCheckAuth,
    user: { username: 'testuser' },
    isAdmin: false,
    logout: vi.fn(),
    changePassword: vi.fn(),
  }),
}))

vi.mock('@/stores/theme', () => ({
  useThemeStore: () => ({
    init: mockThemeInit,
    themeClasses: '',
    isDark: false,
    colorMode: 'system',
    toggleColorMode: vi.fn(),
  }),
}))

vi.mock('@/stores/notifications', () => ({
  useNotificationsStore: () => ({
    notifications: [],
    add: vi.fn(),
    remove: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    clear: vi.fn(),
  }),
}))

describe('App', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockCheckAuth.mockClear()
    mockThemeInit.mockClear()
    mockIsAuthenticated = false

    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    })

    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })))

    document.body.innerHTML = ''
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function createWrapper() {
    return mount(App, {
      global: {
        plugins: [createPinia()],
        stubs: {
          TopNav: {
            template: '<div class="top-nav-stub"><slot /></div>',
          },
          Notifications: {
            template: '<div class="notifications-stub"></div>',
          },
          RouterView: {
            template: '<div class="router-view-stub"></div>',
          },
        },
      },
      attachTo: document.body,
    })
  }

  describe('initialization', () => {
    it('should initialize theme on mount', async () => {
      createWrapper()
      await flushPromises()

      expect(mockThemeInit).toHaveBeenCalled()
    })

    it('should check auth on mount', async () => {
      createWrapper()
      await flushPromises()

      expect(mockCheckAuth).toHaveBeenCalled()
    })
  })

  describe('authenticated state', () => {
    it('should render TopNav when authenticated', async () => {
      mockIsAuthenticated = true
      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.find('.top-nav-stub').exists()).toBe(true)
    })

    it('should not render TopNav when not authenticated', async () => {
      mockIsAuthenticated = false
      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.find('.top-nav-stub').exists()).toBe(false)
    })
  })

  describe('notifications', () => {
    it('should always render Notifications component', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.find('.notifications-stub').exists()).toBe(true)
    })
  })

  describe('theme classes', () => {
    it('should apply theme classes to root div', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.find('.min-h-screen').exists()).toBe(true)
    })
  })
})
