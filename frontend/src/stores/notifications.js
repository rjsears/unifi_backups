// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// UniFi Backup Manager - Notifications Store
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationsStore = defineStore('notifications', () => {
  // State
  const notifications = ref([])
  let nextId = 0

  // Actions
  function add(notification) {
    const id = nextId++
    const duration = notification.duration ?? 5000

    notifications.value.push({
      id,
      type: notification.type || 'info',
      title: notification.title,
      message: notification.message,
      duration
    })

    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }

    return id
  }

  function remove(id) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  function success(title, message) {
    return add({ type: 'success', title, message })
  }

  function error(title, message) {
    return add({ type: 'error', title, message, duration: 8000 })
  }

  function warning(title, message) {
    return add({ type: 'warning', title, message })
  }

  function info(title, message) {
    return add({ type: 'info', title, message })
  }

  function clear() {
    notifications.value = []
  }

  return {
    notifications,
    add,
    remove,
    success,
    error,
    warning,
    info,
    clear
  }
})
