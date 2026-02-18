// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// UniFi Backup Manager - Theme Store
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // State
  const colorMode = ref('system') // 'light', 'dark', 'system'
  const systemPrefersDark = ref(false)

  // Getters
  const isDark = computed(() => {
    if (colorMode.value === 'system') {
      return systemPrefersDark.value
    }
    return colorMode.value === 'dark'
  })

  const themeClasses = computed(() => {
    return isDark.value ? 'dark' : ''
  })

  // Actions
  function init() {
    // Load saved preference
    const saved = localStorage.getItem('colorMode')
    if (saved) {
      colorMode.value = saved
    }

    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    systemPrefersDark.value = mediaQuery.matches

    // Listen for system preference changes
    mediaQuery.addEventListener('change', (e) => {
      systemPrefersDark.value = e.matches
    })

    // Apply initial theme
    applyTheme()
  }

  function setColorMode(mode) {
    colorMode.value = mode
    localStorage.setItem('colorMode', mode)
    applyTheme()
  }

  function toggleColorMode() {
    const modes = ['light', 'dark', 'system']
    const currentIndex = modes.indexOf(colorMode.value)
    const nextIndex = (currentIndex + 1) % modes.length
    setColorMode(modes[nextIndex])
  }

  function applyTheme() {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Watch for changes
  watch(isDark, () => {
    applyTheme()
  })

  return {
    colorMode,
    isDark,
    themeClasses,
    init,
    setColorMode,
    toggleColorMode
  }
})
