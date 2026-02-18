<!--
  -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  UniFi Backup Manager - Login View
  -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
-->
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useNotificationsStore } from '@/stores/notifications'
import { UserIcon, EyeIcon, EyeSlashIcon, LockClosedIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const notificationStore = useNotificationsStore()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

const isValid = computed(() => username.value.length > 0 && password.value.length > 0)

async function handleLogin() {
  if (!isValid.value) return

  loading.value = true
  error.value = ''

  try {
    const success = await authStore.login({ username: username.value, password: password.value })
    if (success) {
      notificationStore.success('Welcome back!')
      router.push('/')
    } else {
      error.value = authStore.error || 'Invalid credentials'
      notificationStore.error('Login Failed', error.value)
    }
  } catch (err) {
    error.value = err.response?.data?.detail || 'Login failed'
    notificationStore.error('Login Failed', error.value)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div :class="themeStore.themeClasses" class="min-h-screen flex items-center justify-center p-4" style="background-color: var(--color-bg-primary);">
    <div class="w-full max-w-md">
      <!-- Logo/Title -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
          <svg class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold" style="color: var(--color-text-primary);">
          UniFi Backup
        </h1>
        <p class="mt-2" style="color: var(--color-text-secondary);">Backup Manager</p>
      </div>

      <!-- Login Form -->
      <form
        class="rounded-xl border p-6"
        style="background-color: var(--color-surface); border-color: var(--color-border);"
        @submit.prevent="handleLogin"
      >
        <!-- Error Alert -->
        <div
          v-if="error"
          class="mb-4 p-3 bg-red-100 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30 rounded-lg"
        >
          <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
        </div>

        <!-- Username Field -->
        <div class="mb-4">
          <label for="username" class="block text-sm font-medium mb-1.5" style="color: var(--color-text-primary);">
            Username
          </label>
          <div class="relative">
            <UserIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style="color: var(--color-text-muted);" />
            <input
              id="username"
              v-model="username"
              type="text"
              autocomplete="username"
              placeholder="Enter your username"
              class="input pl-10"
            >
          </div>
        </div>

        <!-- Password Field -->
        <div class="mb-6">
          <label for="password" class="block text-sm font-medium mb-1.5" style="color: var(--color-text-primary);">
            Password
          </label>
          <div class="relative">
            <LockClosedIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style="color: var(--color-text-muted);" />
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="Enter your password"
              class="input pl-10 pr-10"
            >
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70"
              style="color: var(--color-text-muted);"
              @click="showPassword = !showPassword"
            >
              <EyeSlashIcon v-if="showPassword" class="h-5 w-5" />
              <EyeIcon v-else class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="!isValid || loading"
          class="w-full py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-primary-600 text-white hover:bg-primary-700"
        >
          <span v-if="loading" class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Signing in...
          </span>
          <span v-else>Sign In</span>
        </button>
      </form>

      <!-- Footer -->
      <div class="text-center text-sm mt-6" style="color: var(--color-text-muted);">
        <p>UniFi Backup Manager v1.0.0</p>
      </div>
    </div>
  </div>
</template>
