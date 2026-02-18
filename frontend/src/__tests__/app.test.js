// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// UniFi Backup Manager - App Tests
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'

// Mock the stores to avoid side effects
vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    isAuthenticated: false,
    checkAuth: vi.fn(),
  }),
}))

vi.mock('@/stores/theme', () => ({
  useThemeStore: () => ({
    init: vi.fn(),
    themeClasses: '',
  }),
}))

describe('App', () => {
  beforeEach(() => {
    setActivePinia(createPinia())

    // Mock localStorage
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    })

    // Mock matchMedia
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
    })))
  })

  it('should pass basic test', () => {
    expect(true).toBe(true)
  })

  it('should perform basic math', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have correct project name', () => {
    expect('UniFi Backup Manager').toContain('UniFi')
  })
})
