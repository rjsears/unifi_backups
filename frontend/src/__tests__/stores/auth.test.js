// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// UniFi Backup Manager - Auth Store Tests
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

// Mock vue-router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock the API module
vi.mock('@/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
  },
}))

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem: vi.fn((key) => localStorageMock.store[key] || null),
  setItem: vi.fn((key, value) => {
    localStorageMock.store[key] = value
  }),
  removeItem: vi.fn((key) => {
    delete localStorageMock.store[key]
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {}
  }),
}

describe('Auth Store', () => {
  let store
  let api

  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.stubGlobal('localStorage', localStorageMock)
    localStorageMock.clear()
    mockPush.mockClear()

    // Get the mocked api
    api = (await import('@/api')).default
    vi.clearAllMocks()

    store = useAuthStore()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('initial state', () => {
    it('should start with null user', () => {
      expect(store.user).toBeNull()
    })

    it('should start not authenticated', () => {
      expect(store.isAuthenticated).toBe(false)
    })

    it('should start not as admin', () => {
      expect(store.isAdmin).toBe(false)
    })

    it('should start with no loading state', () => {
      expect(store.loading).toBe(false)
    })

    it('should start with no error', () => {
      expect(store.error).toBeNull()
    })
  })

  describe('isAuthenticated computed', () => {
    it('should return false when no token', () => {
      store.accessToken = null
      store.user = { username: 'test' }
      expect(store.isAuthenticated).toBe(false)
    })

    it('should return false when no user', () => {
      store.accessToken = 'token'
      store.user = null
      expect(store.isAuthenticated).toBe(false)
    })

    it('should return true when both token and user exist', () => {
      store.accessToken = 'token'
      store.user = { username: 'test' }
      expect(store.isAuthenticated).toBe(true)
    })
  })

  describe('isAdmin computed', () => {
    it('should return false when user is null', () => {
      store.user = null
      expect(store.isAdmin).toBe(false)
    })

    it('should return false when user is not admin', () => {
      store.user = { username: 'test', is_admin: false }
      expect(store.isAdmin).toBe(false)
    })

    it('should return true when user is admin', () => {
      store.user = { username: 'admin', is_admin: true }
      expect(store.isAdmin).toBe(true)
    })
  })

  describe('login', () => {
    it('should set loading state during login', async () => {
      api.post.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: {} }), 100))
      )
      api.get.mockResolvedValue({ data: { username: 'test' } })

      const loginPromise = store.login({ username: 'test', password: 'pass' })
      expect(store.loading).toBe(true)

      await loginPromise
      expect(store.loading).toBe(false)
    })

    it('should store tokens on successful login', async () => {
      api.post.mockResolvedValue({
        data: { access_token: 'access123', refresh_token: 'refresh123' },
      })
      api.get.mockResolvedValue({ data: { username: 'test' } })

      await store.login({ username: 'test', password: 'pass' })

      expect(localStorageMock.setItem).toHaveBeenCalledWith('accessToken', 'access123')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refreshToken', 'refresh123')
    })

    it('should fetch user after successful login', async () => {
      api.post.mockResolvedValue({
        data: { access_token: 'access123', refresh_token: 'refresh123' },
      })
      api.get.mockResolvedValue({ data: { username: 'testuser', is_admin: true } })

      await store.login({ username: 'test', password: 'pass' })

      expect(api.get).toHaveBeenCalledWith('/api/auth/me')
      expect(store.user).toEqual({ username: 'testuser', is_admin: true })
    })

    it('should return true on successful login', async () => {
      api.post.mockResolvedValue({
        data: { access_token: 'access123', refresh_token: 'refresh123' },
      })
      api.get.mockResolvedValue({ data: { username: 'test' } })

      const result = await store.login({ username: 'test', password: 'pass' })

      expect(result).toBe(true)
    })

    it('should return false and set error on failed login', async () => {
      api.post.mockRejectedValue({
        response: { data: { detail: 'Invalid credentials' } },
      })

      const result = await store.login({ username: 'test', password: 'wrong' })

      expect(result).toBe(false)
      expect(store.error).toBe('Invalid credentials')
    })

    it('should set generic error when no detail provided', async () => {
      api.post.mockRejectedValue(new Error('Network error'))

      const result = await store.login({ username: 'test', password: 'pass' })

      expect(result).toBe(false)
      expect(store.error).toBe('Login failed')
    })
  })

  describe('logout', () => {
    beforeEach(() => {
      store.user = { username: 'test' }
      store.accessToken = 'token'
      localStorageMock.store.accessToken = 'token'
      localStorageMock.store.refreshToken = 'refresh'
    })

    it('should clear user state', () => {
      store.logout()

      expect(store.user).toBeNull()
      expect(store.accessToken).toBeNull()
    })

    it('should remove tokens from localStorage', () => {
      store.logout()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('accessToken')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken')
    })

    it('should redirect to login page', () => {
      store.logout()

      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  describe('checkAuth', () => {
    it('should do nothing when no stored token', async () => {
      localStorageMock.store = {}

      await store.checkAuth()

      expect(api.get).not.toHaveBeenCalled()
    })

    it('should restore tokens from localStorage', async () => {
      localStorageMock.store.accessToken = 'stored-access'
      localStorageMock.store.refreshToken = 'stored-refresh'
      api.get.mockResolvedValue({ data: { username: 'test' } })

      await store.checkAuth()

      expect(store.accessToken).toBe('stored-access')
    })

    it('should fetch user when token exists', async () => {
      localStorageMock.store.accessToken = 'stored-access'
      api.get.mockResolvedValue({ data: { username: 'test' } })

      await store.checkAuth()

      expect(api.get).toHaveBeenCalledWith('/api/auth/me')
    })
  })

  describe('changePassword', () => {
    it('should return success on successful password change', async () => {
      api.put.mockResolvedValue({})

      const result = await store.changePassword('current', 'newpass')

      expect(result).toEqual({ success: true })
      expect(api.put).toHaveBeenCalledWith('/api/auth/password', {
        current_password: 'current',
        new_password: 'newpass',
      })
    })

    it('should return error on failed password change', async () => {
      api.put.mockRejectedValue({
        response: { data: { detail: 'Wrong password' } },
      })

      const result = await store.changePassword('wrong', 'newpass')

      expect(result).toEqual({ success: false, error: 'Wrong password' })
    })

    it('should return generic error when no detail provided', async () => {
      api.put.mockRejectedValue(new Error('Network error'))

      const result = await store.changePassword('current', 'newpass')

      expect(result).toEqual({ success: false, error: 'Password change failed' })
    })
  })
})
