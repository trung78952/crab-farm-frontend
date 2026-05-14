<template>
  <div>
    <div class="panel">
      <div class="panel-header d-flex justify-content-between align-items-center">
        <span>Shelves</span>
        <b-button size="sm" variant="primary" @click="openCreate">Create Shelf</b-button>
      </div>
      <div class="panel-body">
        <DataTable :items="shelves" :fields="fields">
          <template #actions="{ item }">
            <b-button size="sm" variant="outline-warning" class="mr-1" @click="maintenance(item)">Maintenance</b-button>
            <b-button size="sm" variant="outline-success" @click="activate(item)">Activate</b-button>
          </template>
        </DataTable>
      </div>
    </div>
    <b-modal id="shelf-modal" title="Shelf" @ok="save">
      <b-form-group label="Code"><b-form-input v-model="form.code" /></b-form-group>
      <b-form-group label="Name"><b-form-input v-model="form.name" /></b-form-group>
      <b-form-group label="Description"><b-form-textarea v-model="form.description" rows="2" /></b-form-group>
    </b-modal>
  </div>
</template>

<script>
import DataTable from '../components/DataTable.vue'
import shelvesApi from '../api/shelves'

export default {
  name: 'Shelves',
  components: { DataTable },
  data() {
    return {
      shelves: [],
      form: {},
      fields: ['code', 'name', 'status', 'motion_device_id', 'camera_device_id', 'created_at', 'actions']
    }
  },
  created() { this.load() },
  methods: {
    async load() { this.shelves = (await shelvesApi.list()).data },
    openCreate() {
      this.form = { code: 'SHELF_01', name: 'Shelf 01', description: '', status: 'active' }
      this.$bvModal.show('shelf-modal')
    },
    async save() {
      await shelvesApi.create(this.form)
      await this.load()
    },
    async maintenance(item) {
      await shelvesApi.maintenance(item.id)
      await this.load()
    },
    async activate(item) {
      await shelvesApi.activate(item.id)
      await this.load()
    }
  }
}
</script>
