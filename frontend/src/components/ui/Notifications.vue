<!--
  -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  UniFi Backup Manager - Toast Notifications Component
  -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
-->
<template>
  <teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      <transition-group
        enter-active-class="transition ease-out duration-300"
        enter-from-class="transform translate-x-full opacity-0"
        enter-to-class="transform translate-x-0 opacity-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="transform translate-x-0 opacity-100"
        leave-to-class="transform translate-x-full opacity-0"
      >
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="[
            'rounded-lg shadow-lg border p-4',
            bgClass(notification.type)
          ]"
          style="background-color: var(--color-surface); border-color: var(--color-border);"
        >
          <div class="flex items-start">
            <div :class="['flex-shrink-0', iconClass(notification.type)]">
              <component :is="icon(notification.type)" class="h-5 w-5" />
            </div>
            <div class="ml-3 flex-1">
              <p class="text-sm font-medium" style="color: var(--color-text-primary);">
                {{ notification.title }}
              </p>
              <p v-if="notification.message" class="mt-1 text-sm" style="color: var(--color-text-secondary);">
                {{ notification.message }}
              </p>
            </div>
            <button
              class="ml-4 flex-shrink-0 rounded-lg p-1 transition-colors hover:bg-gray-100 dark:hover:bg-slate-800"
              style="color: var(--color-text-muted);"
              @click="notificationsStore.remove(notification.id)"
            >
              <XMarkIcon class="h-4 w-4" />
            </button>
          </div>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useNotificationsStore } from '@/stores/notifications'
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const notificationsStore = useNotificationsStore()
const notifications = computed(() => notificationsStore.notifications)

function icon(type) {
  const icons = {
    success: CheckCircleIcon,
    error: ExclamationCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon
  }
  return icons[type] || InformationCircleIcon
}

function iconClass(type) {
  const classes = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  }
  return classes[type] || 'text-blue-500'
}

function bgClass(type) {
  const classes = {
    success: 'border-l-4 border-l-green-500',
    error: 'border-l-4 border-l-red-500',
    warning: 'border-l-4 border-l-yellow-500',
    info: 'border-l-4 border-l-blue-500'
  }
  return classes[type] || ''
}
</script>
