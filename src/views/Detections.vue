<template>
  <div>
    <div class="panel">
      <div class="panel-header d-flex justify-content-between align-items-center">
        <span>Detections</span>
        <b-input v-model="filter" size="sm" placeholder="Filter tank/class/status" class="w-auto" />
      </div>
      <div class="panel-body">
        <DataTable :items="filtered" :fields="fields">
          <template #actions="{ item }">
            <b-button size="sm" variant="outline-success" class="mr-1" @click="verify(item, true)">Correct</b-button>
            <b-button size="sm" variant="outline-warning" @click="openWrong(item)">Wrong</b-button>
          </template>
        </DataTable>
      </div>
    </div>
    <b-modal id="verify-modal" title="Correct Label" @ok="saveWrong">
      <b-form-group label="Human label"><b-form-select v-model="humanLabel" :options="classes" /></b-form-group>
    </b-modal>
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
      selected: null,
      humanLabel: 'crab_normal',
      classes: ['crab_normal', 'crab_molting', 'crab_soft_shell', 'empty_tank', 'uncertain_or_bad_image'],
      fields: ['tank_id', 'image_id', 'class_name', 'confidence', 'action', 'model_name', 'model_version', 'is_verified', 'human_label', 'detected_at', 'actions']
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
    async load() { this.detections = (await detectionsApi.list()).data },
    async verify(item, isCorrect) {
      await detectionsApi.verify(item.id, { is_correct: isCorrect, human_label: isCorrect ? item.class_name : this.humanLabel })
      await this.load()
    },
    openWrong(item) {
      this.selected = item
      this.humanLabel = item.class_name
      this.$bvModal.show('verify-modal')
    },
    async saveWrong() {
      await detectionsApi.verify(this.selected.id, { is_correct: false, human_label: this.humanLabel })
      await this.load()
    }
  }
}
</script>
