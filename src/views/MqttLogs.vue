<template>
  <div class="panel">
    <div class="panel-header d-flex justify-content-between align-items-center">
      <span>MQTT Logs</span>
      <b-button size="sm" variant="outline-info" @click="load">Refresh</b-button>
    </div>
    <div class="panel-body">
      <DataTable :items="logs" :fields="fields">
        <template #payload="{ item }"><JsonViewer :value="item.payload" /></template>
      </DataTable>
    </div>
  </div>
</template>

<script>
import DataTable from '../components/DataTable.vue'
import JsonViewer from '../components/JsonViewer.vue'
import mqttLogsApi from '../api/mqttLogs'

export default {
  name: 'MqttLogs',
  components: { DataTable, JsonViewer },
  data() {
    return {
      logs: [],
      fields: ['direction', 'topic', 'qos', { key: 'payload', label: 'payload' }, 'created_at']
    }
  },
  created() { this.load() },
  methods: {
    async load() { this.logs = (await mqttLogsApi.list(200)).data }
  }
}
</script>
