<template>
  <div class="panel">
    <div class="panel-header d-flex justify-content-between align-items-center">
      <span>Recheck Tasks</span>
      <b-button size="sm" variant="outline-info" @click="runDueNow">Run Due Now</b-button>
    </div>
    <div class="panel-body">
      <DataTable :items="tasks" :fields="fields">
        <template #actions="{ item }">
          <b-button size="sm" variant="outline-danger" :disabled="item.status === 'cancelled'" @click="cancel(item)">Cancel</b-button>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script>
import DataTable from '../components/DataTable.vue'
import recheckApi from '../api/recheckTasks'

export default {
  name: 'RecheckTasks',
  components: { DataTable },
  data() {
    return {
      tasks: [],
      fields: ['tank_id', 'reason', 'status', 'run_at', 'priority', 'created_at', 'actions']
    }
  },
  created() { this.load() },
  methods: {
    async load() { this.tasks = (await recheckApi.list()).data },
    async cancel(item) { await recheckApi.cancel(item.id); await this.load() },
    async runDueNow() { await recheckApi.runDueNow(); await this.load() }
  }
}
</script>
