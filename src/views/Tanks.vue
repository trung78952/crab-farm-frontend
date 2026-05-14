<template>
  <div class="panel">
    <div class="panel-header d-flex justify-content-between align-items-center">
      <span>Tanks</span>
      <b-button size="sm" variant="primary" @click="openCreate">Create Tank</b-button>
    </div>
    <div class="panel-body">
      <b-form-group label="Shelf filter" label-cols-md="2">
        <b-form-select v-model="shelfFilter" :options="shelfOptions" />
      </b-form-group>
      <DataTable :items="filteredTanks" :fields="fields" :busy="busy">
        <template #actions="{ item }">
          <b-button size="sm" variant="outline-info" class="mr-1" @click="scan(item)">Scan Tank</b-button>
          <b-button size="sm" variant="outline-light" class="mr-1" @click="move(item)">Move To Tank</b-button>
          <b-button size="sm" variant="outline-danger" @click="remove(item)">Delete</b-button>
        </template>
      </DataTable>
    </div>

    <b-modal id="tank-modal" title="Tank" @ok="save">
      <b-form-group label="Code"><b-form-input v-model="form.code" /></b-form-group>
      <b-form-group label="Shelf"><b-form-select v-model="form.shelf_id" :options="shelfOptions" /></b-form-group>
      <b-form-group label="Name"><b-form-input v-model="form.name" /></b-form-group>
      <b-form-row>
        <b-col><b-form-group label="Row"><b-form-input v-model.number="form.row_index" type="number" /></b-form-group></b-col>
        <b-col><b-form-group label="Column"><b-form-input v-model.number="form.col_index" type="number" /></b-form-group></b-col>
        <b-col><b-form-group label="Level"><b-form-input v-model.number="form.level_index" type="number" /></b-form-group></b-col>
      </b-form-row>
      <b-form-row>
        <b-col><b-form-group label="X"><b-form-input v-model.number="form.x_position" type="number" /></b-form-group></b-col>
        <b-col><b-form-group label="Y"><b-form-input v-model.number="form.y_position" type="number" /></b-form-group></b-col>
        <b-col><b-form-group label="Z"><b-form-input v-model.number="form.z_position" type="number" /></b-form-group></b-col>
      </b-form-row>
    </b-modal>
  </div>
</template>

<script>
import DataTable from '../components/DataTable.vue'
import tanksApi from '../api/tanks'
import scansApi from '../api/scans'
import motionApi from '../api/motion'
import shelvesApi from '../api/shelves'

export default {
  name: 'Tanks',
  components: { DataTable },
  data() {
    return {
      busy: false,
      tanks: [],
      shelves: [],
      shelfFilter: '',
      form: {},
      fields: ['shelf_id', 'code', 'name', 'row_index', 'col_index', 'level_index', 'x_position', 'y_position', 'z_position', 'status', 'last_checked_at', 'actions']
    }
  },
  computed: {
    shelfOptions() {
      return [{ value: '', text: 'All shelves' }, ...this.shelves.map(s => ({ value: s.id, text: `${s.code} - ${s.name}` }))]
    },
    filteredTanks() {
      return this.shelfFilter ? this.tanks.filter(t => t.shelf_id === this.shelfFilter) : this.tanks
    }
  },
  created() { this.load() },
  methods: {
    async load() {
      this.busy = true
      try {
        const [tanks, shelves] = await Promise.all([tanksApi.list(), shelvesApi.list()])
        this.tanks = tanks.data
        this.shelves = shelves.data
      } finally { this.busy = false }
    },
    openCreate() {
      this.form = { shelf_id: this.shelfFilter || null, code: '', name: '', row_index: 0, col_index: 0, level_index: 0, x_position: 0, y_position: 0, z_position: 0, status: 'empty' }
      this.$bvModal.show('tank-modal')
    },
    async save() {
      await tanksApi.create(this.form)
      await this.load()
    },
    async remove(tank) {
      if (!window.confirm(`Delete tank ${tank.code}?`)) return
      await tanksApi.remove(tank.id)
      await this.load()
    },
    async scan(tank) {
      await scansApi.runTank(tank.id)
      this.$bvToast.toast('Scan job queued', { title: tank.code, variant: 'info', solid: true })
    },
    async move(tank) {
      await motionApi.moveToTank(tank.id, { speed: 3000 })
      this.$bvToast.toast('Move command sent', { title: tank.code, variant: 'info', solid: true })
    }
  }
}
</script>
