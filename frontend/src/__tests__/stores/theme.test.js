// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// UniFi Backup Manager - Theme Store Tests
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useThemeStore } from '@/stores/theme'

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem: vi.fn((key) => localStorageMock.store[key] || null),
  setItem: vi.fn((key, value) => { localStorageMock.store[key] = value }),
  removeItem: vi.fn((key) => { delete localStorageMock.store[key] }),
  clear: vi.fn(() => { localStorageMock.store = {} }),
}

// Mock matchMedia
const matchMediaMock = vi.fn((query) => ({
  matches: false,
  media: query,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}))

describe('Theme Store', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())

    // Setup mocks
    vi.stubGlobal('localStorage', localStorageMock)
    vi.stubGlobal('matchMedia', matchMediaMock)
    localStorageMock.clear()

    // Mock document.documentElement
    document.documentElement.classList.remove('dark')

    store = useThemeStore()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('initial state', () => {
    it('should default to system color mode', () => {
      expect(store.colorMode).toBe('system')
    })

    it('should default systemPrefersDark to false', () => {
      expect(store.isDark).toBe(false)
    })
  })

  describe('isDark computed', () => {
    it('should return false when colorMode is light', () => {
      store.colorMode = 'light'
      expect(store.isDark).toBe(false)
    })

    it('should return true when colorMode is dark', () => {
      store.colorMode = 'dark'
      expect(store.isDark).toBe(true)
    })

    it('should use system preference when colorMode is system', () => {
      // When colorMode is system and system prefers light (default mock)
      store.colorMode = 'system'
      // isDark should follow systemPrefersDark which defaults to false in our mock
      expect(store.isDark).toBe(false)
    })
  })

  describe('themeClasses computed', () => {
    it('should return "dark" when isDark is true', () => {
      store.colorMode = 'dark'
      expect(store.themeClasses).toBe('dark')
    })

    it('should return empty string when isDark is false', () => {
      store.colorMode = 'light'
      expect(store.themeClasses).toBe('')
    })
  })

  describe('setColorMode', () => {
    it('should update colorMode', () => {
      store.setColorMode('dark')
      expect(store.colorMode).toBe('dark')
    })

    it('should save to localStorage', () => {
      store.setColorMode('dark')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('colorMode', 'dark')
    })

    it('should apply theme to document', () => {
      store.setColorMode('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)

      store.setColorMode('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })

  describe('toggleColorMode', () => {
    it('should cycle through modes: light -> dark -> system -> light', () => {
      store.colorMode = 'light'

      store.toggleColorMode()
      expect(store.colorMode).toBe('dark')

      store.toggleColorMode()
      expect(store.colorMode).toBe('system')

      store.toggleColorMode()
      expect(store.colorMode).toBe('light')
    })
  })

  describe('init', () => {
    it('should load saved preference from localStorage', () => {
      localStorageMock.store.colorMode = 'dark'

      store.init()

      expect(store.colorMode).toBe('dark')
    })

    it('should check system preference', () => {
      matchMediaMock.mockReturnValueOnce({
        matches: true,
        addEventListener: vi.fn(),
      })

      store.init()

      expect(matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
    })

    it('should apply theme on init', () => {
      localStorageMock.store.colorMode = 'dark'

      store.init()

      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })
})
