<template>
  <div>
    <div class="panel">
      <div class="panel-header d-flex justify-content-between align-items-center">
        <span>Scan Jobs</span>
        <b-button size="sm" variant="primary" :disabled="busy || !canOperate" @click="runAll">
          <b-spinner v-if="busy" small /> Run All
        </b-button>
      </div>
      <div class="panel-body">
        <b-alert v-if="$store.state.simulationMode" show variant="warning" class="mb-3">
          Simulation Mode: jobs/items finish as simulated, not success.
        </b-alert>
        <DataTable style="height: 80vh;" :items="jobs" :fields="jobFields">
          <template #actions="{ item }">
            <b-button size="sm" variant="outline-info" @click="selected = item">Details</b-button>
          </template>
        </DataTable>
      </div>
    </div>
    <div class="panel" v-if="selected">
      <div class="panel-header">Job Items</div>
      <div class="panel-body">
        <DataTable :items="selected.items || []" :fields="itemFields" />
      </div>
    </div>
  </div>
</template>

<script>
import DataTable from '../components/DataTable.vue'
import scansApi from '../api/scans'

export default {
  name: 'ScanJobs',
  components: { DataTable },
  data() {
    return {
      busy: false,
      jobs: [],
      selected: null,
      jobFields: ['status', 'job_type', 'shelf_id', 'scan_mode', 'priority', 'total_tanks', 'completed_tanks', 'failed_tanks', 'is_simulation', 'started_at', 'completed_at', 'actions'],
      itemFields: ['tank_id', 'status', 'motion_command_id', 'camera_command_id', 'image_id', 'detection_id', 'error_message', 'started_at', 'completed_at']
    }
  },
  computed: {
    canOperate() { return this.$store.getters.canOperate }
  },
  watch: {
    '$store.state.events.length'() {
      const event = this.$store.state.events[0]
      if (!event) return
      if (event.event === 'scan_job_created' || event.event === 'scan_job_updated') this.mergeJob(event.data)
      if (event.event === 'scan_job_item_updated') this.mergeItem(event.data)
    }
  },
  created() { this.load() },
  methods: {
    async load() {
      this.jobs = (await scansApi.jobsV2()).data
      this.selected = this.jobs[0] || null
    },
    async runAll() {
      this.busy = true
      try {
        await scansApi.runAll()
        await this.load()
      } finally {
        this.busy = false
      }
    },
    mergeJob(job) {
      if (!job || !job.id) return
      const index = this.jobs.findIndex(item => item.id === job.id)
      if (index === -1) this.jobs.unshift(job)
      else this.$set(this.jobs, index, { ...this.jobs[index], ...job })
      if (this.selected && this.selected.id === job.id) this.selected = this.jobs.find(item => item.id === job.id)
    },
    mergeItem(item) {
      if (!item || !item.scan_job_id) return
      const job = this.jobs.find(entry => entry.id === item.scan_job_id)
      if (!job) return
      job.items = job.items || []
      const index = job.items.findIndex(entry => entry.id === item.id)
      if (index === -1) job.items.push(item)
      else this.$set(job.items, index, { ...job.items[index], ...item })
    }
  }
}
</script>
