<template>
  <div>
    <div class="panel">
      <div class="panel-header d-flex justify-content-between align-items-center">
        <span>Scan Jobs</span>
        <b-button size="sm" variant="primary" @click="runAll">Run All</b-button>
      </div>
      <div class="panel-body">
        <DataTable :items="jobs" :fields="jobFields">
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
      jobs: [],
      selected: null,
      jobFields: ['status', 'job_type', 'shelf_id', 'scan_mode', 'priority', 'total_tanks', 'completed_tanks', 'failed_tanks', 'is_simulation', 'started_at', 'completed_at', 'actions'],
      itemFields: ['tank_id', 'status', 'motion_command_id', 'camera_command_id', 'image_id', 'detection_id', 'error_message', 'started_at', 'completed_at']
    }
  },
  created() { this.load() },
  methods: {
    async load() {
      this.jobs = (await scansApi.jobsV2()).data
      this.selected = this.jobs[0] || null
    },
    async runAll() {
      await scansApi.runAll()
      await this.load()
    }
  }
}
</script>
