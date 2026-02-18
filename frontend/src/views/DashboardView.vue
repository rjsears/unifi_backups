<!--
  -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  UniFi Backup Manager - Dashboard View
  -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
-->
<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold" style="color: var(--color-text-primary);">Dashboard</h1>
      <p class="mt-1" style="color: var(--color-text-secondary);">Overview of your UniFi backup system</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Devices"
        :value="stats.totalDevices"
        icon="server"
        color="primary"
      />
      <StatCard
        title="Total Backups"
        :value="stats.totalBackups"
        icon="archive"
        color="green"
      />
      <StatCard
        title="Active Schedules"
        :value="stats.activeSchedules"
        icon="calendar"
        color="purple"
      />
      <StatCard
        title="Storage Used"
        :value="stats.storageUsed"
        icon="storage"
        color="yellow"
      />
    </div>

    <!-- Devices Section -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold" style="color: var(--color-text-primary);">Devices</h2>
        <router-link to="/devices" class="text-sm text-primary-600 dark:text-primary-400 hover:underline">
          View All
        </router-link>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="spinner w-8 h-8" />
      </div>

      <div v-else-if="devices.length === 0" class="card p-8 text-center">
        <ServerIcon class="w-12 h-12 mx-auto mb-4" style="color: var(--color-text-muted);" />
        <p class="font-medium" style="color: var(--color-text-primary);">No devices configured</p>
        <p class="text-sm mt-1" style="color: var(--color-text-secondary);">Add your first UniFi device to get started</p>
        <router-link to="/devices" class="btn-primary mt-4 inline-block">
          Add Device
        </router-link>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DeviceCard
          v-for="device in devices"
          :key="device.id"
          :device="device"
        />
      </div>
    </div>

    <!-- Recent Backups -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold" style="color: var(--color-text-primary);">Recent Backups</h2>
        <router-link to="/backups" class="text-sm text-primary-600 dark:text-primary-400 hover:underline">
          View All
        </router-link>
      </div>

      <div class="card overflow-hidden">
        <table class="table">
          <thead>
            <tr>
              <th>Device</th>
              <th>Filename</th>
              <th>Size</th>
              <th>Type</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="recentBackups.length === 0">
              <td colspan="6" class="text-center py-8" style="color: var(--color-text-muted);">
                No backups yet
              </td>
            </tr>
            <tr v-for="backup in recentBackups" :key="backup.id">
              <td>{{ backup.device_name }}</td>
              <td class="font-mono text-xs">{{ backup.filename }}</td>
              <td>{{ formatSize(backup.file_size) }}</td>
              <td>
                <span :class="backup.backup_type === 'scheduled' ? 'badge-info' : 'badge-success'">
                  {{ backup.backup_type }}
                </span>
              </td>
              <td>
                <span :class="statusBadgeClass(backup.status)">
                  {{ backup.status }}
                </span>
              </td>
              <td>{{ formatDate(backup.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { formatDistanceToNow } from 'date-fns'
import { ServerIcon } from '@heroicons/vue/24/outline'
import StatCard from '@/components/dashboard/StatCard.vue'
import DeviceCard from '@/components/dashboard/DeviceCard.vue'
// import api from '@/api'  // Will be used in later phases

const loading = ref(true)
const devices = ref([])
const recentBackups = ref([])
const stats = ref({
  totalDevices: 0,
  totalBackups: 0,
  activeSchedules: 0,
  storageUsed: '0 GB'
})

onMounted(async () => {
  await loadDashboardData()
})

async function loadDashboardData() {
  loading.value = true
  try {
    // These will be implemented in later phases
    // For now, we'll use placeholder data
    devices.value = []
    recentBackups.value = []
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  } finally {
    loading.value = false
  }
}

function formatSize(bytes) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
}

function statusBadgeClass(status) {
  const classes = {
    completed: 'badge-success',
    running: 'badge-info',
    pending: 'badge-warning',
    failed: 'badge-danger'
  }
  return classes[status] || 'badge'
}
</script>
