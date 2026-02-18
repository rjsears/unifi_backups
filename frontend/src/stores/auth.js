// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// UniFi Backup Manager - Auth Store
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()

  // State
  const user = ref(null)
  const accessToken = ref(null)
  const refreshToken = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
  const isAdmin = computed(() => user.value?.is_admin || false)

  // Actions
  async function login(credentials) {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/api/auth/login', credentials)
      accessToken.value = response.data.access_token
      refreshToken.value = response.data.refresh_token

      // Store tokens
      localStorage.setItem('accessToken', accessToken.value)
      localStorage.setItem('refreshToken', refreshToken.value)

      // Fetch user info
      await fetchUser()

      return true
    } catch (err) {
      error.value = err.response?.data?.detail || 'Login failed'
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchUser() {
    try {
      const response = await api.get('/api/auth/me')
      user.value = response.data
    } catch (err) {
      logout()
    }
  }

  async function checkAuth() {
    const storedToken = localStorage.getItem('accessToken')
    const storedRefresh = localStorage.getItem('refreshToken')

    if (storedToken) {
      accessToken.value = storedToken
      refreshToken.value = storedRefresh

      try {
        await fetchUser()
      } catch {
        // Token might be expired, try refresh
        if (storedRefresh) {
          await refreshAccessToken()
        }
      }
    }
  }

  async function refreshAccessToken() {
    if (!refreshToken.value) {
      logout()
      return false
    }

    try {
      const response = await api.post('/api/auth/refresh', {
        refresh_token: refreshToken.value
      })

      accessToken.value = response.data.access_token
      refreshToken.value = response.data.refresh_token

      localStorage.setItem('accessToken', accessToken.value)
      localStorage.setItem('refreshToken', refreshToken.value)

      await fetchUser()
      return true
    } catch {
      logout()
      return false
    }
  }

  async function changePassword(currentPassword, newPassword) {
    try {
      await api.put('/api/auth/password', {
        current_password: currentPassword,
        new_password: newPassword
      })
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.detail || 'Password change failed' }
    }
  }

  function logout() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null

    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')

    router.push('/login')
  }

  return {
    user,
    accessToken,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    checkAuth,
    refreshAccessToken,
    changePassword
  }
})
