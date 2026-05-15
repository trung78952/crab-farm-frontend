<template>
  <div>
    <b-tabs>
      <b-tab title="Sensor Types" active>
        <div class="panel">
          <div class="panel-header">Sensor Types</div>
          <div class="panel-body">
            <b-form inline class="mb-3" @submit.prevent="createType">
              <b-form-input v-model="typeForm.code" placeholder="code" class="mr-2 mb-2" required />
              <b-form-input v-model="typeForm.name" placeholder="name" class="mr-2 mb-2" required />
              <b-form-input v-model="typeForm.unit" placeholder="unit" class="mr-2 mb-2" required />
              <b-form-input v-model.number="typeForm.min_value" type="number" placeholder="min" class="mr-2 mb-2" />
              <b-form-input v-model.number="typeForm.max_value" type="number" placeholder="max" class="mr-2 mb-2" />
              <b-button type="submit" variant="primary" class="mb-2" :disabled="busy">Create</b-button>
            </b-form>
            <DataTable :items="types" :fields="typeFields" />
          </div>
        </div>
      </b-tab>

      <b-tab title="Sensors">
        <div class="panel">
          <div class="panel-header">Sensors</div>
          <div class="panel-body">
            <b-form @submit.prevent="createSensor">
              <b-form-row>
                <b-col md="2"><b-form-group label="Code"><b-form-input v-model="sensorForm.code" required /></b-form-group></b-col>
                <b-col md="3"><b-form-group label="Name"><b-form-input v-model="sensorForm.name" required /></b-form-group></b-col>
                <b-col md="3"><b-form-group label="Type"><b-form-select v-model="sensorForm.sensor_type_id" :options="typeOptions" required /></b-form-group></b-col>
                <b-col md="2"><b-form-group label="Shelf"><b-form-select v-model="sensorForm.shelf_id" :options="shelfOptions" /></b-form-group></b-col>
                <b-col md="2"><b-form-group label="Tank"><b-form-select v-model="sensorForm.tank_id" :options="tankOptions" /></b-form-group></b-col>
              </b-form-row>
              <b-button type="submit" variant="primary" :disabled="busy">Create Sensor</b-button>
            </b-form>
            <hr>
            <DataTable :items="sensors" :fields="sensorFields">
              <template #actions="{ item }">
                <b-button size="sm" variant="outline-warning" @click="deactivate(item)">Deactivate</b-button>
              </template>
            </DataTable>
          </div>
        </div>
      </b-tab>

      <b-tab title="Readings">
        <div class="panel">
          <div class="panel-header">Readings</div>
          <div class="panel-body">
            <b-form @submit.prevent="createReading">
              <b-form-row>
                <b-col md="5"><b-form-group label="Sensor"><b-form-select v-model="readingForm.sensor_id" :options="sensorOptions" required /></b-form-group></b-col>
                <b-col md="2"><b-form-group label="Value"><b-form-input v-model.number="readingForm.value" type="number" required /></b-form-group></b-col>
                <b-col md="2"><b-form-group label="Unit"><b-form-input v-model="readingForm.unit" /></b-form-group></b-col>
                <b-col md="3" class="d-flex align-items-end"><b-button type="submit" variant="primary" class="mb-3" :disabled="busy">Add Reading</b-button></b-col>
              </b-form-row>
            </b-form>
            <DataTable :items="readings" :fields="readingFields" />
          </div>
        </div>
      </b-tab>

      <b-tab title="Alert Rules">
        <div class="panel">
          <div class="panel-header">Alert Rules</div>
          <div class="panel-body">
            <b-form @submit.prevent="createRule">
              <b-form-row>
                <b-col md="3"><b-form-group label="Type"><b-form-select v-model="ruleForm.sensor_type_id" :options="typeOptions" required /></b-form-group></b-col>
                <b-col md="2"><b-form-group label="Shelf"><b-form-select v-model="ruleForm.shelf_id" :options="shelfOptions" /></b-form-group></b-col>
                <b-col md="2"><b-form-group label="Tank"><b-form-select v-model="ruleForm.tank_id" :options="tankOptions" /></b-form-group></b-col>
                <b-col md="2"><b-form-group label="Min"><b-form-input v-model.number="ruleForm.min_value" type="number" /></b-form-group></b-col>
                <b-col md="2"><b-form-group label="Max"><b-form-input v-model.number="ruleForm.max_value" type="number" /></b-form-group></b-col>
                <b-col md="1" class="d-flex align-items-end"><b-button type="submit" variant="primary" class="mb-3" :disabled="busy">Add</b-button></b-col>
              </b-form-row>
            </b-form>
            <DataTable :items="rules" :fields="ruleFields" />
          </div>
        </div>
      </b-tab>

      <b-tab title="Alerts">
        <div class="panel">
          <div class="panel-header">Alerts</div>
          <div class="panel-body">
            <DataTable :items="alerts" :fields="alertFields">
              <template #actions="{ item }">
                <b-button size="sm" variant="outline-info" class="mr-1" :disabled="item.status !== 'open'" @click="ack(item)">Ack</b-button>
                <b-button size="sm" variant="outline-success" :disabled="item.status === 'resolved'" @click="resolve(item)">Resolve</b-button>
              </template>
            </DataTable>
          </div>
        </div>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import DataTable from '../components/DataTable.vue'
import sensorsApi from '../api/sensors'
import shelvesApi from '../api/shelves'
import tanksApi from '../api/tanks'

export default {
  name: 'Sensors',
  components: { DataTable },
  data() {
    return {
      busy: false,
      types: [],
      sensors: [],
      readings: [],
      rules: [],
      alerts: [],
      shelves: [],
      tanks: [],
      typeForm: { code: '', name: '', unit: '', min_value: null, max_value: null },
      sensorForm: { code: '', name: '', sensor_type_id: null, shelf_id: null, tank_id: null, status: 'active' },
      readingForm: { sensor_id: null, value: null, unit: '' },
      ruleForm: { sensor_type_id: null, shelf_id: null, tank_id: null, min_value: null, max_value: null, is_active: true },
      typeFields: ['code', 'name', 'unit', 'min_value', 'max_value', 'created_at'],
      sensorFields: ['code', 'name', 'sensor_type_id', 'tank_id', 'shelf_id', 'status', 'actions'],
      readingFields: ['sensor_id', 'tank_id', 'shelf_id', 'value', 'unit', 'measured_at'],
      ruleFields: ['sensor_type_id', 'tank_id', 'shelf_id', 'min_value', 'max_value', 'is_active'],
      alertFields: ['sensor_id', 'tank_id', 'shelf_id', 'alert_type', 'message', 'status', 'created_at', 'actions']
    }
  },
  computed: {
    typeOptions() { return [{ value: null, text: 'Select type' }, ...this.types.map(type => ({ value: type.id, text: `${type.code} (${type.unit})` }))] },
    sensorOptions() { return [{ value: null, text: 'Select sensor' }, ...this.sensors.map(sensor => ({ value: sensor.id, text: `${sensor.code} - ${sensor.name}` }))] },
    shelfOptions() { return [{ value: null, text: 'No shelf' }, ...this.shelves.map(shelf => ({ value: shelf.id, text: shelf.code }))] },
    tankOptions() { return [{ value: null, text: 'No tank' }, ...this.tanks.map(tank => ({ value: tank.id, text: tank.code }))] }
  },
  watch: {
    '$store.state.events.length'() {
      const event = this.$store.state.events[0]
      if (!event) return
      if (event.event === 'sensor_reading_created') this.merge(this.readings, event.data)
      if (event.event === 'sensor_alert_created') this.merge(this.alerts, event.data)
    }
  },
  created() { this.load() },
  methods: {
    async load() {
      this.busy = true
      try {
        const [types, sensors, readings, rules, alerts, shelves, tanks] = await Promise.all([
          sensorsApi.sensorTypes(),
          sensorsApi.sensors(),
          sensorsApi.readings({ limit: 200 }),
          sensorsApi.alertRules(),
          sensorsApi.alerts(),
          shelvesApi.list(),
          tanksApi.list()
        ])
        this.types = types.data
        this.sensors = sensors.data
        this.readings = readings.data
        this.rules = rules.data
        this.alerts = alerts.data
        this.shelves = shelves.data
        this.tanks = tanks.data
      } finally {
        this.busy = false
      }
    },
    async createType() {
      await sensorsApi.createSensorType(this.clean(this.typeForm))
      this.typeForm = { code: '', name: '', unit: '', min_value: null, max_value: null }
      await this.load()
    },
    async createSensor() {
      await sensorsApi.createSensor(this.clean(this.sensorForm))
      this.sensorForm = { code: '', name: '', sensor_type_id: null, shelf_id: null, tank_id: null, status: 'active' }
      await this.load()
    },
    async createReading() {
      await sensorsApi.createReading(this.clean(this.readingForm))
      this.readingForm = { sensor_id: null, value: null, unit: '' }
      await this.load()
    },
    async createRule() {
      await sensorsApi.createAlertRule(this.clean(this.ruleForm))
      this.ruleForm = { sensor_type_id: null, shelf_id: null, tank_id: null, min_value: null, max_value: null, is_active: true }
      await this.load()
    },
    async deactivate(sensor) { await sensorsApi.deactivateSensor(sensor.id); await this.load() },
    async ack(alert) { await sensorsApi.ackAlert(alert.id); await this.load() },
    async resolve(alert) { await sensorsApi.resolveAlert(alert.id); await this.load() },
    clean(payload) {
      const data = { ...payload }
      Object.keys(data).forEach(key => {
        if (data[key] === '' || data[key] === undefined) data[key] = null
      })
      return data
    },
    merge(list, item) {
      if (!item || !item.id) return
      const index = list.findIndex(existing => existing.id === item.id)
      if (index === -1) list.unshift(item)
      else this.$set(list, index, { ...list[index], ...item })
    }
  }
}
</script>
