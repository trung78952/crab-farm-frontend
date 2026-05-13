<template>
  <div>
    <div class="panel">
      <div class="panel-header">Queue Harvest</div>
      <div class="panel-body">
        <b-input-group prepend="Tank UUID">
          <b-form-input v-model="tankId" />
          <b-input-group-append><b-button variant="primary" @click="queue">Queue</b-button></b-input-group-append>
        </b-input-group>
      </div>
    </div>
    <div class="panel">
      <div class="panel-header">Harvest Queue / History</div>
      <div class="panel-body">
        <DataTable :items="harvests" :fields="fields">
          <template #actions="{ item }">
            <b-button size="sm" variant="outline-info" :disabled="item.status !== 'queued'" @click="start(item)">Start</b-button>
          </template>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script>
import DataTable from '../components/DataTable.vue'
import harvestApi from '../api/harvest'

export default {
  name: 'Harvest',
  components: { DataTable },
  data() {
    return {
      tankId: '',
      harvests: [],
      fields: ['tank_id', 'status', 'detection_id', 'motion_command_id', 'note', 'created_at', 'completed_at', 'actions']
    }
  },
  created() { this.load() },
  methods: {
    async load() { this.harvests = (await harvestApi.list()).data },
    async queue() { await harvestApi.queue(this.tankId); await this.load() },
    async start(item) { await harvestApi.start(item.id); await this.load() }
  }
}
</script>
