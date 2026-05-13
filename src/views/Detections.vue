<template>
  <div class="panel">
    <div class="panel-header d-flex justify-content-between align-items-center">
      <span>Detections</span>
      <b-input v-model="filter" size="sm" placeholder="Filter tank/class/status" class="w-auto" />
    </div>
    <div class="panel-body">
      <DataTable :items="filtered" :fields="fields" />
    </div>
  </div>
</template>

<script>
import DataTable from '../components/DataTable.vue'
import detectionsApi from '../api/detections'

export default {
  name: 'Detections',
  components: { DataTable },
  data() {
    return {
      filter: '',
      detections: [],
      fields: ['tank_id', 'image_id', 'class_name', 'confidence', 'action', 'model_name', 'detected_at']
    }
  },
  computed: {
    filtered() {
      const term = this.filter.toLowerCase()
      if (!term) return this.detections
      return this.detections.filter(d => JSON.stringify(d).toLowerCase().includes(term))
    }
  },
  created() { this.load() },
  methods: {
    async load() { this.detections = (await detectionsApi.list()).data }
  }
}
</script>
