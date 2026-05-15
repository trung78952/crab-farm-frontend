<template>
  <div>
    <div class="panel">
      <div class="panel-header">Create User Schedule</div>
      <div class="panel-body">
        <b-form @submit.prevent="create">
          <b-form-row>
            <b-col md="3"><b-form-group label="Shelf"><b-form-select v-model="form.shelf_id" :options="shelfOptions" /></b-form-group></b-col>
            <b-col md="3"><b-form-group label="Name"><b-form-input v-model="form.name" required /></b-form-group></b-col>
            <b-col md="2"><b-form-group label="Interval minutes"><b-form-input v-model.number="form.interval_minutes" type="number" min="1" required /></b-form-group></b-col>
            <b-col md="2"><b-form-group label="Scan mode"><b-form-select v-model="form.scan_mode" :options="scanModes" /></b-form-group></b-col>
            <b-col md="2"><b-form-group label="Priority"><b-form-input v-model.number="form.priority" type="number" min="0" /></b-form-group></b-col>
          </b-form-row>
          <b-form-row v-if="form.scan_mode !== 'all_tanks'">
            <b-col md="6">
              <b-form-group :label="form.scan_mode === 'single_tank' ? 'Tank' : 'Selected tanks'">
                <b-form-select v-if="form.scan_mode === 'single_tank'" v-model="singleTankId" :options="tankOptions" />
                <b-form-select v-else v-model="selectedTankIds" :options="tankOptions" multiple />
              </b-form-group>
            </b-col>
          </b-form-row>
          <b-form-checkbox v-model="form.run_immediately" class="mb-2">
            Run first scan immediately
          </b-form-checkbox>
          <div class="text-muted small mb-2">If unchecked, the first scan runs after the configured interval.</div>
          <b-button type="submit" variant="primary" :disabled="busy">
            <b-spinner v-if="busy" small /> Create Schedule
          </b-button>
        </b-form>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header d-flex justify-content-between align-items-center">
        <span>Schedules</span>
        <div class="d-flex filter-row">
          <b-form-select v-model="filters.tag" :options="tagOptions" size="sm" />
          <b-form-select v-model="filters.active" :options="activeOptions" size="sm" />
        </div>
      </div>
      <div class="panel-body">
        <DataTable :items="filteredSchedules" :fields="fields">
          <template #actions="{ item }">
            <b-badge :variant="item.tag === 'AUTO' ? 'warning' : 'info'" class="mr-2">{{ item.tag }}</b-badge>
            <b-button size="sm" variant="outline-info" class="mr-1" @click="toggle(item)">
              {{ item.is_active ? 'Disable' : 'Enable' }}
            </b-button>
            <b-button size="sm" variant="outline-danger" @click="cancel(item)">Cancel</b-button>
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
import tanksApi from '../api/tanks'

export default {
  name: 'ScanSchedules',
  components: { DataTable },
  data() {
    return {
      busy: false,
      schedules: [],
      shelves: [],
      tanks: [],
      selectedTankIds: [],
      singleTankId: null,
      filters: { tag: '', active: '' },
      form: {
        shelf_id: null,
        name: '',
        schedule_type: 'user_periodic',
        tag: 'USER',
        interval_minutes: 120,
        scan_mode: 'all_tanks',
        is_active: true,
        priority: 100,
        run_immediately: false
      },
      scanModes: ['all_tanks', 'selected_tanks', 'single_tank'],
      fields: ['name', 'tag', 'schedule_type', 'shelf_id', 'scan_mode', 'interval_minutes', 'priority', 'is_active', 'run_count', 'next_run_at', 'last_run_at', 'actions'],
      tagOptions: [{ value: '', text: 'All tags' }, { value: 'USER', text: 'USER' }, { value: 'AUTO', text: 'AUTO' }],
      activeOptions: [{ value: '', text: 'All status' }, { value: 'true', text: 'Active' }, { value: 'false', text: 'Inactive' }]
    }
  },
  computed: {
    shelfOptions() { return [{ value: null, text: 'All shelves' }, ...this.shelves.map(s => ({ value: s.id, text: `${s.code} - ${s.name}` }))] },
    tankOptions() {
      return this.tanks
        .filter(tank => !this.form.shelf_id || tank.shelf_id === this.form.shelf_id)
        .map(tank => ({ value: tank.id, text: `${tank.code} - ${tank.name}` }))
    },
    filteredSchedules() {
      return this.schedules
        .filter(item => !this.filters.tag || item.tag === this.filters.tag)
        .filter(item => this.filters.active === '' || String(item.is_active) === this.filters.active)
    }
  },
  watch: {
    '$store.state.events.length'() {
      const event = this.$store.state.events[0]
      if (event && (event.event === 'scan_schedule_created' || event.event === 'scan_schedule_updated')) this.merge(event.data)
    }
  },
  created() { this.load() },
  methods: {
    async load() {
      const [schedules, shelves, tanks] = await Promise.all([scansApi.schedules(), shelvesApi.list(), tanksApi.list()])
      this.schedules = schedules.data
      this.shelves = shelves.data
      this.tanks = tanks.data
    },
    async create() {
      this.busy = true
      try {
        const payload = { ...this.form }
        if (payload.scan_mode === 'single_tank') payload.tank_ids = this.singleTankId ? [this.singleTankId] : []
        if (payload.scan_mode === 'selected_tanks') payload.tank_ids = this.selectedTankIds
        if (payload.scan_mode === 'all_tanks') payload.tank_ids = null
        await scansApi.createSchedule(payload)
        this.form.name = ''
        this.form.run_immediately = false
        this.selectedTankIds = []
        this.singleTankId = null
        await this.load()
      } finally {
        this.busy = false
      }
    },
    async toggle(item) {
      if (item.is_active) await scansApi.disableSchedule(item.id)
      else await scansApi.enableSchedule(item.id)
      await this.load()
    },
    async cancel(item) {
      if (!window.confirm(`Cancel schedule ${item.name}?`)) return
      await scansApi.cancelSchedule(item.id)
      await this.load()
    },
    merge(item) {
      if (!item || !item.id) return
      const index = this.schedules.findIndex(schedule => schedule.id === item.id)
      if (index === -1) this.schedules.unshift(item)
      else this.$set(this.schedules, index, { ...this.schedules[index], ...item })
    }
  }
}
</script>

<style scoped>
.filter-row {
  gap: 8px;
}
</style>
