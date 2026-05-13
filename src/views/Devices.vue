<template>
  <div class="panel">
    <div class="panel-header">Devices</div>
    <div class="panel-body">
      <DataTable :items="devices" :fields="fields">
        <template #payload="{ item }"><JsonViewer :value="item.metadata" /></template>
      </DataTable>
    </div>
  </div>
</template>

<script>
import DataTable from '../components/DataTable.vue'
import JsonViewer from '../components/JsonViewer.vue'
import devicesApi from '../api/devices'

export default {
  name: 'Devices',
  components: { DataTable, JsonViewer },
  data() {
    return {
      devices: [],
      fields: ['code', 'type', 'name', 'status', 'last_seen_at', { key: 'payload', label: 'metadata' }]
    }
  },
  created() { this.load() },
  methods: {
    async load() {
      this.devices = (await devicesApi.list()).data
    }
  }
}
</script>
