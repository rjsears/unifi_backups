<!--
  -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  UniFi Backup Manager - Devices View
  -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
-->
<template>
  <div>
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold" style="color: var(--color-text-primary);">Devices</h1>
        <p class="mt-1" style="color: var(--color-text-secondary);">Manage your UniFi devices</p>
      </div>
      <button class="btn-primary" @click="showAddModal = true">
        <PlusIcon class="w-5 h-5 mr-1.5 inline" />
        Add Device
      </button>
    </div>

    <!-- Devices Grid -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="spinner w-8 h-8" />
    </div>

    <div v-else-if="devices.length === 0" class="card p-12 text-center">
      <ServerIcon class="w-16 h-16 mx-auto mb-4" style="color: var(--color-text-muted);" />
      <p class="text-lg font-medium" style="color: var(--color-text-primary);">No devices configured</p>
      <p class="text-sm mt-2 mb-6" style="color: var(--color-text-secondary);">
        Add your first UniFi device to start managing backups
      </p>
      <button class="btn-primary" @click="showAddModal = true">
        <PlusIcon class="w-5 h-5 mr-1.5 inline" />
        Add Your First Device
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <DeviceCard
        v-for="device in devices"
        :key="device.id"
        :device="device"
      />
    </div>

    <!-- Add Device Modal -->
    <Modal v-model="showAddModal" title="Add Device" size="lg">
      <form class="space-y-4" @submit.prevent="handleAddDevice">
        <div>
          <label class="block text-sm font-medium mb-1" style="color: var(--color-text-secondary);">
            Device Name
          </label>
          <input v-model="newDevice.name" type="text" class="input" placeholder="e.g., Main UDM-Pro" required>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1" style="color: var(--color-text-secondary);">
            IP Address
          </label>
          <input v-model="newDevice.ip_address" type="text" class="input" placeholder="e.g., 192.168.1.1" required>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1" style="color: var(--color-text-secondary);">
            Device Type
          </label>
          <select v-model="newDevice.device_type" class="input" required>
            <option value="">Select device type</option>
            <option value="UDM-Pro">UDM-Pro</option>
            <option value="UDM-SE">UDM-SE</option>
            <option value="UDM">UDM</option>
            <option value="USG">USG</option>
            <option value="USG-Pro">USG-Pro</option>
            <option value="EFG">Enterprise Fortress Gateway</option>
            <option value="UCK">Cloud Key</option>
            <option value="UCK-G2">Cloud Key Gen2</option>
            <option value="UNVR-Pro">NVR Pro</option>
            <option value="UNVR-Enterprise">NVR Enterprise</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1" style="color: var(--color-text-secondary);">
            API Key
          </label>
          <input v-model="newDevice.api_key" type="password" class="input" placeholder="Enter UniFi API key" required>
          <p class="text-xs mt-1" style="color: var(--color-text-muted);">
            Your API key will be encrypted before storage
          </p>
        </div>

        <div class="flex justify-end space-x-3 pt-4">
          <button type="button" class="btn-secondary" @click="showAddModal = false">
            Cancel
          </button>
          <button type="submit" class="btn-primary" :disabled="addingDevice">
            <span v-if="addingDevice">Adding...</span>
            <span v-else>Add Device</span>
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ServerIcon, PlusIcon } from '@heroicons/vue/24/outline'
import Modal from '@/components/ui/Modal.vue'
import DeviceCard from '@/components/dashboard/DeviceCard.vue'
import { useNotificationsStore } from '@/stores/notifications'

const notifications = useNotificationsStore()
const loading = ref(true)
const devices = ref([])
const showAddModal = ref(false)
const addingDevice = ref(false)
const newDevice = ref({
  name: '',
  ip_address: '',
  device_type: '',
  api_key: ''
})

onMounted(async () => {
  await loadDevices()
})

async function loadDevices() {
  loading.value = true
  try {
    // TODO: Implement API call
    devices.value = []
  } catch (error) {
    notifications.error('Error', 'Failed to load devices')
  } finally {
    loading.value = false
  }
}

async function handleAddDevice() {
  addingDevice.value = true
  try {
    // TODO: Implement API call
    notifications.success('Success', 'Device added successfully')
    showAddModal.value = false
    newDevice.value = { name: '', ip_address: '', device_type: '', api_key: '' }
    await loadDevices()
  } catch (error) {
    notifications.error('Error', 'Failed to add device')
  } finally {
    addingDevice.value = false
  }
}
</script>
