<template>
  <div>
    <div class="panel">
      <div class="panel-header d-flex justify-content-between align-items-center">
        <span>Training Samples</span>
        <b-button size="sm" variant="primary" @click="exportYolo">Export YOLO</b-button>
      </div>
      <div class="panel-body">
        <DataTable :items="samples" :fields="fields">
          <template #actions="{ item }">
            <b-button size="sm" variant="outline-info" @click="openLabel(item)">Label</b-button>
          </template>
        </DataTable>
        <div v-if="exportResult" class="console-panel mt-3">{{ exportResult }}</div>
      </div>
    </div>
    <b-modal id="label-modal" title="Label Sample" @ok="saveLabel">
      <b-form-group label="Human label"><b-form-select v-model="labelForm.human_label" :options="classes" /></b-form-group>
      <b-form-group label="Dataset split"><b-form-select v-model="labelForm.dataset_split" :options="['train', 'val', 'test']" /></b-form-group>
      <b-form-group label="Note"><b-form-textarea v-model="labelForm.note" rows="2" /></b-form-group>
    </b-modal>
  </div>
</template>

<script>
import DataTable from '../components/DataTable.vue'
import samplesApi from '../api/trainingSamples'

export default {
  name: 'TrainingSamples',
  components: { DataTable },
  data() {
    return {
      samples: [],
      selected: null,
      labelForm: {},
      exportResult: '',
      classes: ['crab_normal', 'crab_molting', 'crab_soft_shell', 'empty_tank', 'uncertain_or_bad_image'],
      fields: ['image_id', 'tank_id', 'ai_label', 'human_label', 'is_verified', 'dataset_split', 'created_at', 'actions']
    }
  },
  created() { this.load() },
  methods: {
    async load() { this.samples = (await samplesApi.list()).data },
    openLabel(item) {
      this.selected = item
      this.labelForm = { human_label: item.human_label || item.ai_label || 'crab_normal', dataset_split: item.dataset_split || 'train', note: item.note || '' }
      this.$bvModal.show('label-modal')
    },
    async saveLabel() {
      await samplesApi.label(this.selected.id, this.labelForm)
      await this.load()
    },
    async exportYolo() {
      const res = await samplesApi.exportYolo()
      this.exportResult = JSON.stringify(res.data, null, 2)
    }
  }
}
</script>
