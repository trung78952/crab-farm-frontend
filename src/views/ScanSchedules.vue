<template>
  <div>
    <div class="panel">
      <div class="panel-header">Create Scan Schedule</div>
      <div class="panel-body">
        <b-form @submit.prevent="create">
          <b-form-row>
            <b-col md="3"><b-form-group label="Shelf"><b-form-select v-model="form.shelf_id" :options="shelfOptions" /></b-form-group></b-col>
            <b-col md="4"><b-form-group label="Name"><b-form-input v-model="form.name" required /></b-form-group></b-col>
            <b-col md="2"><b-form-group label="Interval minutes"><b-form-input v-model.number="form.interval_minutes" type="number" min="1" required /></b-form-group></b-col>
            <b-col md="3">
              <b-form-group label="Scan mode">
                <b-form-select v-model="form.scan_mode" :options="['all_tanks', 'selected_tanks', 'single_shelf']" />
              </b-form-group>
            </b-col>
            <b-col md="3"><b-form-group label="Selected tank ids"><b-form-input v-model="tankIdsText" placeholder="uuid, uuid" /></b-form-group></b-col>
            <b-col md="2"><b-form-group label="Priority"><b-form-input v-model.number="form.priority" type="number" min="0" /></b-form-group></b-col>
          </b-form-row>
          <div class="text-muted small mb-2">Schedules enqueue scan jobs. Jobs are serialized per shelf and never run motion in parallel on the same shelf.</div>
          <b-button type="submit" variant="primary">Create Schedule</b-button>
        </b-form>
      </div>
    </div>
    <div class="panel">
      <div class="panel-header">Schedules</div>
      <div class="panel-body">
        <DataTable :items="schedules" :fields="fields">
          <template #actions="{ item }">
            <b-button size="sm" variant="outline-info" class="mr-1" @click="toggle(item)">
              {{ item.is_active ? 'Disable' : 'Enable' }}
            </b-button>
            <b-button size="sm" variant="outline-danger" @click="remove(item)">Delete</b-button>
          </template>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script>
import DataTable from '../components/DataTable.vue'
import scansApi from '../api/scans'
import shelvesApi from '../api/shelves'

export default {
  name: 'ScanSchedules',
  components: { DataTable },
  data() {
    return {
      schedules: [],
      shelves: [],
      tankIdsText: '',
      form: { shelf_id: null, name: '', interval_minutes: 120, scan_mode: 'all_tanks', is_active: true, priority: 100 },
      fields: ['shelf_id', 'name', 'interval_minutes', 'scan_mode', 'priority', 'is_active', 'last_run_at', 'next_run_at', 'actions']
    }
  },
  computed: {
    shelfOptions() {
      return [{ value: null, text: 'All shelves' }, ...this.shelves.map(s => ({ value: s.id, text: `${s.code} - ${s.name}` }))]
    }
  },
  created() { this.load() },
  methods: {
    async load() {
      const [schedules, shelves] = await Promise.all([scansApi.schedules(), shelvesApi.list()])
      this.schedules = schedules.data
      this.shelves = shelves.data
    },
    async create() {
      const payload = { ...this.form }
      if (payload.scan_mode === 'selected_tanks') {
        payload.tank_ids = this.tankIdsText.split(',').map(v => v.trim()).filter(Boolean)
      }
      await scansApi.createSchedule(payload)
      this.form.name = ''
      this.tankIdsText = ''
      await this.load()
    },
    async toggle(item) {
      if (item.is_active) await scansApi.disableSchedule(item.id)
      else await scansApi.enableSchedule(item.id)
      await this.load()
    },
    async remove(item) {
      if (!window.confirm(`Delete schedule ${item.name}?`)) return
      await scansApi.deleteSchedule(item.id)
      await this.load()
    }
  }
}
</script>
