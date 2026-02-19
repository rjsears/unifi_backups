// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// UniFi Backup Manager - API Module Tests
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import axios from 'axios'

// Mock axios
vi.mock('axios', () => {
  const mockAxiosInstance = {
    interceptors: {
      request: {
        use: vi.fn(),
      },
      response: {
        use: vi.fn(),
      },
    },
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
      post: vi.fn(),
    },
  }
})

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

describe('API Module', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', localStorageMock)
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  describe('axios instance creation', () => {
    it('should create axios instance with correct config', async () => {
      // Re-import to trigger module initialization
      await import('@/api')

      expect(axios.create).toHaveBeenCalledWith({
        baseURL: expect.any(String),
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })
  })

  describe('interceptors registration', () => {
    it('should register request interceptor', async () => {
      const api = await import('@/api')
      const mockInstance = axios.create()

      expect(mockInstance.interceptors.request.use).toHaveBeenCalled()
    })

    it('should register response interceptor', async () => {
      const api = await import('@/api')
      const mockInstance = axios.create()

      expect(mockInstance.interceptors.response.use).toHaveBeenCalled()
    })
  })

  describe('request interceptor behavior', () => {
    it('should add Authorization header when token exists', async () => {
      localStorageMock.store.accessToken = 'test-token'
      await import('@/api')
      const mockInstance = axios.create()

      // Get the request interceptor function that was passed
      const requestInterceptor = mockInstance.interceptors.request.use.mock.calls[0][0]

      const config = { headers: {} }
      const result = requestInterceptor(config)

      expect(result.headers.Authorization).toBe('Bearer test-token')
    })

    it('should not add Authorization header when no token', async () => {
      localStorageMock.store = {}
      await import('@/api')
      const mockInstance = axios.create()

      const requestInterceptor = mockInstance.interceptors.request.use.mock.calls[0][0]

      const config = { headers: {} }
      const result = requestInterceptor(config)

      expect(result.headers.Authorization).toBeUndefined()
    })
  })
})
