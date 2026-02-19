// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// UniFi Backup Manager - Router Tests
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// Mock vue-router
vi.mock('vue-router', () => ({
  createRouter: vi.fn(() => ({
    beforeEach: vi.fn(),
  })),
  createWebHistory: vi.fn(),
}))

// Mock auth store
let mockIsAuthenticated = false
const mockCheckAuth = vi.fn()

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    isAuthenticated: mockIsAuthenticated,
    checkAuth: mockCheckAuth,
  }),
}))

// Mock view components
vi.mock('@/views/LoginView.vue', () => ({ default: {} }))
vi.mock('@/views/DashboardView.vue', () => ({ default: {} }))
vi.mock('@/views/DevicesView.vue', () => ({ default: {} }))
vi.mock('@/views/BackupsView.vue', () => ({ default: {} }))
vi.mock('@/views/SchedulesView.vue', () => ({ default: {} }))
vi.mock('@/views/SettingsView.vue', () => ({ default: {} }))

describe('Router', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockIsAuthenticated = false
    mockCheckAuth.mockClear()
    vi.resetModules()
  })

  describe('route definitions', () => {
    it('should define login route', async () => {
      const { createRouter } = await import('vue-router')
      await import('@/router')

      expect(createRouter).toHaveBeenCalled()
      const routerConfig = createRouter.mock.calls[0][0]

      const loginRoute = routerConfig.routes.find((r) => r.path === '/login')
      expect(loginRoute).toBeDefined()
      expect(loginRoute.name).toBe('login')
      expect(loginRoute.meta.requiresAuth).toBe(false)
    })

    it('should define dashboard route', async () => {
      const { createRouter } = await import('vue-router')
      await import('@/router')

      const routerConfig = createRouter.mock.calls[0][0]

      const dashboardRoute = routerConfig.routes.find((r) => r.path === '/')
      expect(dashboardRoute).toBeDefined()
      expect(dashboardRoute.name).toBe('dashboard')
      expect(dashboardRoute.meta.requiresAuth).toBe(true)
    })

    it('should define devices route', async () => {
      const { createRouter } = await import('vue-router')
      await import('@/router')

      const routerConfig = createRouter.mock.calls[0][0]

      const devicesRoute = routerConfig.routes.find((r) => r.path === '/devices')
      expect(devicesRoute).toBeDefined()
      expect(devicesRoute.name).toBe('devices')
      expect(devicesRoute.meta.requiresAuth).toBe(true)
    })

    it('should define backups route', async () => {
      const { createRouter } = await import('vue-router')
      await import('@/router')

      const routerConfig = createRouter.mock.calls[0][0]

      const backupsRoute = routerConfig.routes.find((r) => r.path === '/backups')
      expect(backupsRoute).toBeDefined()
      expect(backupsRoute.name).toBe('backups')
      expect(backupsRoute.meta.requiresAuth).toBe(true)
    })

    it('should define schedules route', async () => {
      const { createRouter } = await import('vue-router')
      await import('@/router')

      const routerConfig = createRouter.mock.calls[0][0]

      const schedulesRoute = routerConfig.routes.find((r) => r.path === '/schedules')
      expect(schedulesRoute).toBeDefined()
      expect(schedulesRoute.name).toBe('schedules')
      expect(schedulesRoute.meta.requiresAuth).toBe(true)
    })

    it('should define settings route', async () => {
      const { createRouter } = await import('vue-router')
      await import('@/router')

      const routerConfig = createRouter.mock.calls[0][0]

      const settingsRoute = routerConfig.routes.find((r) => r.path === '/settings')
      expect(settingsRoute).toBeDefined()
      expect(settingsRoute.name).toBe('settings')
      expect(settingsRoute.meta.requiresAuth).toBe(true)
    })

    it('should define catch-all route that redirects to home', async () => {
      const { createRouter } = await import('vue-router')
      await import('@/router')

      const routerConfig = createRouter.mock.calls[0][0]

      const catchAllRoute = routerConfig.routes.find((r) => r.path === '/:pathMatch(.*)*')
      expect(catchAllRoute).toBeDefined()
      expect(catchAllRoute.redirect).toBe('/')
    })
  })

  describe('navigation guard', () => {
    it('should register beforeEach guard', async () => {
      const { createRouter } = await import('vue-router')
      await import('@/router')

      const router = createRouter.mock.results[0].value
      expect(router.beforeEach).toHaveBeenCalled()
    })
  })
})
