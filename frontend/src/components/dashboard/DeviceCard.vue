<!--
  -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  UniFi Backup Manager - Device Card Component
  -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
-->
<template>
  <div
    class="card p-4 hover:border-primary-500/50 transition-colors cursor-pointer"
    @click="$router.push(`/devices/${device.id}`)"
  >
    <div class="flex items-start space-x-4">
      <!-- Device Image -->
      <div
        class="flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center"
        style="background-color: var(--color-bg-secondary);"
      >
        <img
          v-if="deviceImage"
          :src="deviceImage"
          :alt="device.device_type"
          class="w-12 h-12 object-contain"
          @error="imageError = true"
        >
        <ServerIcon v-else class="w-8 h-8" style="color: var(--color-text-muted);" />
      </div>

      <!-- Device Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between">
          <h3 class="font-medium truncate" style="color: var(--color-text-primary);">
            {{ device.name }}
          </h3>
          <span :class="statusClass" class="flex items-center text-xs">
            <span :class="statusDotClass" class="w-2 h-2 rounded-full mr-1" />
            {{ statusText }}
          </span>
        </div>
        <p class="text-sm truncate" style="color: var(--color-text-secondary);">
          {{ device.ip_address }}
        </p>
        <p class="text-xs mt-1" style="color: var(--color-text-muted);">
          {{ device.device_type }}
          <span v-if="device.firmware_version"> · v{{ device.firmware_version }}</span>
        </p>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center space-x-2 mt-4 pt-4 border-t" style="border-color: var(--color-border);">
      <button
        class="flex-1 btn-primary text-sm py-1.5"
        @click.stop="handleBackupNow"
      >
        Backup Now
      </button>
      <button
        class="flex-1 btn-secondary text-sm py-1.5"
        @click.stop="handleReviewBackups"
      >
        Review Backups
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ServerIcon } from '@heroicons/vue/24/outline'
import { useNotificationsStore } from '@/stores/notifications'

const props = defineProps({
  device: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const notifications = useNotificationsStore()
const imageError = ref(false)

const deviceImage = computed(() => {
  if (imageError.value) return null
  const typeMap = {
    'UDM-Pro': 'udm-pro.png',
    'UDM-SE': 'udm-se.png',
    'UDM': 'udm.png',
    'USG': 'usg.png',
    'USG-Pro': 'usg-pro.png',
    'EFG': 'efg.png',
    'UCK': 'uck.png',
    'UCK-G2': 'uck-g2.png',
    'UNVR-Pro': 'unvr-pro.png',
    'UNVR-Enterprise': 'unvr-enterprise.png',
  }
  const filename = typeMap[props.device.device_type]
  return filename ? `/device-images/${filename}` : null
})

const statusClass = computed(() => {
  if (!props.device.is_active) return 'text-gray-500'
  if (props.device.last_seen) return 'text-green-600 dark:text-green-400'
  return 'text-yellow-600 dark:text-yellow-400'
})

const statusDotClass = computed(() => {
  if (!props.device.is_active) return 'bg-gray-400'
  if (props.device.last_seen) return 'bg-green-500'
  return 'bg-yellow-500'
})

const statusText = computed(() => {
  if (!props.device.is_active) return 'Inactive'
  if (props.device.last_seen) return 'Online'
  return 'Unknown'
})

function handleBackupNow() {
  notifications.info('Backup Started', `Starting backup for ${props.device.name}`)
  // TODO: Implement backup trigger
}

function handleReviewBackups() {
  router.push(`/backups?device=${props.device.id}`)
}
</script>
