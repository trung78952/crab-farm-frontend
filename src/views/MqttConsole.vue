<template>
  <div>
    <div class="panel">
      <div class="panel-header d-flex justify-content-between align-items-center">
        <span>MQTT Console</span>
        <b-button size="sm" variant="outline-light" @click="clearLocal">Clear Local</b-button>
      </div>
      <div class="panel-body">
        <b-form-row>
          <b-col md="4">
            <b-form-group label="Topic">
              <b-form-select v-model="selectedTopic" :options="topicOptions" @change="load" />
            </b-form-group>
          </b-col>
          <b-col md="4"><b-form-group label="Contains"><b-form-input v-model="contains" /></b-form-group></b-col>
          <b-col md="4">
            <b-form-group label="Direction">
              <b-form-select v-model="direction" :options="['all', 'publish', 'subscribe']" @change="load" />
            </b-form-group>
          </b-col>
        </b-form-row>
        <div class="mqtt-console">
          <div v-for="log in filteredLogs" :key="log.id || `${log.topic}-${log.created_at}`" class="mqtt-line">
            <span class="time">{{ formatDateTime(log.created_at) }}</span>
            <span :class="['direction', log.direction]">{{ log.direction }}</span>
            <span class="topic">{{ log.topic }}</span>
            <pre>{{ pretty(log.payload) }}</pre>
          </div>
        </div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-header">Publish</div>
      <div class="panel-body">
        <b-form-row>
          <b-col md="8"><b-form-group label="Topic"><b-form-input v-model="publishForm.topic" /></b-form-group></b-col>
          <b-col md="2"><b-form-group label="QoS"><b-form-input v-model.number="publishForm.qos" type="number" min="0" max="2" /></b-form-group></b-col>
          <b-col md="2"><b-form-checkbox v-model="publishForm.retain" class="mt-4">Retain</b-form-checkbox></b-col>
        </b-form-row>
        <b-form-group label="Payload JSON">
          <b-form-textarea v-model="payloadText" rows="5" />
        </b-form-group>
        <b-button variant="primary" :disabled="publishBusy" @click="publish">
          <b-spinner v-if="publishBusy" small /> Publish
        </b-button>
      </div>
    </div>
  </div>
</template>

<script>
import mqttConsoleApi from '../api/mqttConsole'
import { formatDateTime } from '../utils/dateTime'

export default {
  name: 'MqttConsole',
  data() {
    return {
      logs: [],
      topics: [],
      selectedTopic: '',
      contains: '',
      direction: 'all',
      publishBusy: false,
      clearedAt: null,
      publishForm: { topic: 'farm/shelf/SHELF_01/motion/cmd', qos: 0, retain: false },
      payloadText: '{\n  "type": "home"\n}'
    }
  },
  computed: {
    topicOptions() {
      return [{ value: '', text: 'All topics' }, ...this.topics.map(topic => ({ value: topic, text: topic }))]
    },
    filteredLogs() {
      const term = this.contains.toLowerCase()
      return this.logs
        .concat(this.$store.state.mqttLogs.filter(log => !this.clearedAt || new Date(log.created_at) > this.clearedAt))
        .filter(log => !this.selectedTopic || log.topic === this.selectedTopic)
        .filter(log => this.direction === 'all' || log.direction === this.direction)
        .filter(log => !term || log.topic.toLowerCase().includes(term) || JSON.stringify(log.payload || {}).toLowerCase().includes(term))
        .slice(0, 300)
    }
  },
  created() {
    this.load()
  },
  methods: {
    formatDateTime,
    pretty(value) { return JSON.stringify(value || {}, null, 2) },
    async load() {
      this.topics = (await mqttConsoleApi.topics()).data
      this.logs = (await mqttConsoleApi.logs({ limit: 200, topic: this.selectedTopic || undefined, direction: this.direction === 'all' ? undefined : this.direction })).data
    },
    clearLocal() {
      this.logs = []
      this.clearedAt = new Date()
    },
    async publish() {
      this.publishBusy = true
      try {
        const payload = JSON.parse(this.payloadText)
        await mqttConsoleApi.publish({ ...this.publishForm, payload })
      } finally {
        this.publishBusy = false
      }
    }
  }
}
</script>

<style scoped>
.mqtt-console {
  background: #080b10;
  border: 1px solid #30343f;
  border-radius: 6px;
  font-family: Consolas, Monaco, monospace;
  max-height: 520px;
  overflow: auto;
  padding: 10px;
}
.mqtt-line {
  border-bottom: 1px solid #1e222b;
  padding: 6px 0;
}
.time { color: #8891a3; margin-right: 8px; }
.direction { display: inline-block; min-width: 76px; text-transform: uppercase; }
.direction.publish { color: #44d7cf; }
.direction.subscribe { color: #b8e986; }
.topic { color: #f0c36a; }
pre { color: #d7dae3; margin: 4px 0 0; white-space: pre-wrap; }
</style>
