<template>
  <div>
    <b-row>
      <b-col lg="3" class="mb-3">
        <div class="panel farm-sidebar">
          <div class="panel-header d-flex justify-content-between align-items-center">
            <span>Shelves</span>
            <b-button size="sm" variant="primary" :disabled="!canOperate" @click="openShelf()">Create</b-button>
          </div>
          <div class="panel-body p-2">
            <button v-for="shelf in shelves" :key="shelf.id" :class="['shelf-row', selectedShelfId === shelf.id ? 'active' : '']" @click="selectShelf(shelf.id)">
              <span>
                <strong>{{ shelf.code }}</strong>
                <small>{{ shelf.name }}</small>
              </span>
              <b-badge :variant="shelf.status === 'active' ? 'success' : 'warning'">{{ shelf.status }}</b-badge>
            </button>
          </div>
        </div>
      </b-col>

      <b-col lg="9">
        <div v-if="!selectedShelf" class="panel">
          <div class="panel-body text-muted">No shelf selected.</div>
        </div>
        <div v-else class="panel">
          <div class="panel-header d-flex justify-content-between align-items-center">
            <span>{{ selectedShelf.code }} / {{ selectedShelf.name }}</span>
            <div>
              <b-button size="sm" variant="outline-light" class="mr-1" :disabled="!canOperate" @click="openShelf(selectedShelf)">Edit Shelf</b-button>
              <b-button size="sm" variant="outline-warning" class="mr-1" :disabled="!canOperate" @click="setMaintenance(selectedShelf)">Maintenance</b-button>
              <b-button size="sm" variant="outline-success" :disabled="!canOperate" @click="activateShelf(selectedShelf)">Activate</b-button>
            </div>
          </div>
          <div class="panel-body">
            <b-tabs content-class="mt-3">
              <b-tab title="Shelf Info">
                <b-row>
                  <b-col md="6">
                    <dl class="info-list">
                      <dt>Code</dt>
                      <dd>{{ selectedShelf.code }}</dd>
                      <dt>Name</dt>
                      <dd>{{ selectedShelf.name }}</dd>
                      <dt>Status</dt>
                      <dd>{{ selectedShelf.status }}</dd>
                      <dt>Description</dt>
                      <dd>{{ selectedShelf.description || "-" }}</dd>
                    </dl>
                  </b-col>
                  <b-col md="6">
                    <dl class="info-list">
                      <dt>Motion device</dt>
                      <dd>{{ selectedShelf.motion_device_id || "-" }}</dd>
                      <dt>Camera device</dt>
                      <dd>{{ selectedShelf.camera_device_id || "-" }}</dd>
                      <dt>Tanks</dt>
                      <dd>{{ tanksForShelf.length }}</dd>
                      <dt>Updated</dt>
                      <dd>{{ formatDateTime(selectedShelf.updated_at) }}</dd>
                    </dl>
                  </b-col>
                </b-row>
              </b-tab>

              <b-tab title="Tanks">
                <div class="d-flex flex-wrap align-items-end mb-3 tank-toolbar">
                  <b-form-group label="Status">
                    <b-form-select v-model="filters.status" :options="statusOptions" />
                  </b-form-group>
                  <b-form-group label="Level">
                    <b-form-input v-model.number="filters.level_index" type="number" />
                  </b-form-group>
                  <b-form-group label="Row">
                    <b-form-input v-model.number="filters.row_index" type="number" />
                  </b-form-group>
                  <b-form-group label="Column">
                    <b-form-input v-model.number="filters.col_index" type="number" />
                  </b-form-group>
                  <b-button variant="primary" :disabled="!canOperate" @click="openTank()">Create Tank</b-button>
                </div>
                <DataTable :items="filteredTanks" :fields="tankFields" :busy="busy">
                  <template #actions="{item}">
                    <b-button size="sm" variant="outline-light" class="mr-1" :disabled="!canOperate" @click="openTank(item)">Edit</b-button>
                    <b-button size="sm" variant="outline-info" class="mr-1" :disabled="!canOperate || isActionBusy(`scan-${item.id}`)" @click="scanTank(item)"> <b-spinner v-if="isActionBusy(`scan-${item.id}`)" small /> Scan </b-button>
                    <b-button size="sm" variant="outline-light" class="mr-1" :disabled="!canOperate || isActionBusy(`move-${item.id}`)" @click="moveToTank(item)">Move</b-button>
                    <b-button size="sm" variant="outline-danger" :disabled="!canOperate" @click="deleteTank(item)">Delete</b-button>
                  </template>
                </DataTable>
              </b-tab>

              <b-tab title="Layout View">
                <div v-for="level in groupedTanks" :key="level.level" class="layout-level">
                  <div class="level-title">Level {{ level.level }}</div>
                  <div class="tank-grid">
                    <div v-for="tank in level.tanks" :key="tank.id" :class="['tank-card', `status-${tank.status}`]" @click="openTank(tank)">
                      <div class="tank-code">{{ tank.code }}</div>
                      <b-badge>{{ tank.status }}</b-badge>
                      <small>{{ formatDateTime(tank.last_checked_at) || "not checked" }}</small>
                      <small>{{ latestDetection(tank).class_name || "no detection" }}</small>
                      <small v-for="reading in latestReadings(tank).slice(0, 2)" :key="reading.id"> {{ sensorLabel(reading.sensor_id) }}: {{ reading.value }}{{ reading.unit }} </small>
                    </div>
                  </div>
                </div>
              </b-tab>

              <b-tab title="Sensors">
                <DataTable :items="sensors" :fields="sensorFields" />
                <h6 class="mt-3">Latest Readings</h6>
                <DataTable :items="latestReadingsForShelf" :fields="readingFields" />
              </b-tab>
            </b-tabs>
          </div>
        </div>
      </b-col>
    </b-row>

    <b-modal id="shelf-modal" title="Shelf" @ok="saveShelf">
      <b-form-group label="Code"><b-form-input v-model="shelfForm.code" /></b-form-group>
      <b-form-group label="Name"><b-form-input v-model="shelfForm.name" /></b-form-group>
      <b-form-group label="Status"><b-form-select v-model="shelfForm.status" :options="['active', 'inactive', 'maintenance', 'error']" /></b-form-group>
      <b-form-group label="Description"><b-form-textarea v-model="shelfForm.description" rows="2" /></b-form-group>
    </b-modal>

    <b-modal id="tank-modal" title="Tank" @ok="saveTank">
      <b-form-row>
        <b-col
          ><b-form-group label="Code"><b-form-input v-model="tankForm.code" /></b-form-group
        ></b-col>
        <b-col
          ><b-form-group label="Status"><b-form-select v-model="tankForm.status" :options="tankStatuses" /></b-form-group
        ></b-col>
      </b-form-row>
      <b-form-group label="Shelf"><b-form-select v-model="tankForm.shelf_id" :options="shelfOptions" /></b-form-group>
      <b-form-group label="Name"><b-form-input v-model="tankForm.name" /></b-form-group>
      <b-form-row>
        <b-col
          ><b-form-group label="Level"><b-form-input v-model.number="tankForm.level_index" type="number" /></b-form-group
        ></b-col>
        <b-col
          ><b-form-group label="Row"><b-form-input v-model.number="tankForm.row_index" type="number" /></b-form-group
        ></b-col>
        <b-col
          ><b-form-group label="Column"><b-form-input v-model.number="tankForm.col_index" type="number" /></b-form-group
        ></b-col>
      </b-form-row>
      <b-form-row>
        <b-col
          ><b-form-group label="X"><b-form-input v-model.number="tankForm.x_position" type="number" /></b-form-group
        ></b-col>
        <b-col
          ><b-form-group label="Y"><b-form-input v-model.number="tankForm.y_position" type="number" /></b-form-group
        ></b-col>
        <b-col
          ><b-form-group label="Z"><b-form-input v-model.number="tankForm.z_position" type="number" /></b-form-group
        ></b-col>
      </b-form-row>
    </b-modal>
  </div>
</template>

<script>
import DataTable from "../components/DataTable.vue";
import shelvesApi from "../api/shelves";
import tanksApi from "../api/tanks";
import scansApi from "../api/scans";
import motionApi from "../api/motion";
import detectionsApi from "../api/detections";
import sensorsApi from "../api/sensors";
import {formatDateTime} from "../utils/dateTime";

export default {
  name: "FarmLayout",
  components: {DataTable},
  data() {
    return {
      busy: false,
      shelves: [],
      tanks: [],
      detections: [],
      sensors: [],
      sensorTypes: [],
      latestReadingsForShelf: [],
      selectedShelfId: null,
      actionBusy: {},
      shelfForm: {},
      tankForm: {},
      filters: {status: "", level_index: null, row_index: null, col_index: null},
      tankStatuses: ["empty", "normal", "molting", "soft_shell", "harvested", "error"],
      tankFields: ["code", "name", "status", "level_index", "row_index", "col_index", "last_checked_at", "actions"],
      sensorFields: ["code", "name", "sensor_type_id", "tank_id", "shelf_id", "status"],
      readingFields: ["sensor_id", "tank_id", "shelf_id", "value", "unit", "measured_at"],
    };
  },
  computed: {
    canOperate() {
      return this.$store.getters.canOperate;
    },
    selectedShelf() {
      return this.shelves.find((shelf) => shelf.id === this.selectedShelfId);
    },
    shelfOptions() {
      return this.shelves.map((shelf) => ({value: shelf.id, text: `${shelf.code} - ${shelf.name}`}));
    },
    statusOptions() {
      return [{value: "", text: "All"}, ...this.tankStatuses.map((status) => ({value: status, text: status}))];
    },
    tanksForShelf() {
      return this.tanks.filter((tank) => tank.shelf_id === this.selectedShelfId);
    },
    filteredTanks() {
      return this.tanksForShelf
        .filter((tank) => !this.filters.status || tank.status === this.filters.status)
        .filter((tank) => this.filters.level_index === null || this.filters.level_index === "" || tank.level_index === this.filters.level_index)
        .filter((tank) => this.filters.row_index === null || this.filters.row_index === "" || tank.row_index === this.filters.row_index)
        .filter((tank) => this.filters.col_index === null || this.filters.col_index === "" || tank.col_index === this.filters.col_index);
    },
    groupedTanks() {
      const groups = {};
      this.filteredTanks.forEach((tank) => {
        const level = tank.level_index || 0;
        if (!groups[level]) groups[level] = [];
        groups[level].push(tank);
      });
      return Object.keys(groups)
        .sort((a, b) => Number(a) - Number(b))
        .map((level) => ({
          level,
          tanks: groups[level].sort((a, b) => a.row_index - b.row_index || a.col_index - b.col_index || a.code.localeCompare(b.code)),
        }));
    },
  },
  watch: {
    selectedShelfId() {
      this.loadShelfData();
    },
    "$store.state.events.length"() {
      const event = this.$store.state.events[0];
      if (event) this.applyRealtimeEvent(event);
    },
  },
  created() {
    this.load();
  },
  methods: {
    formatDateTime,
    async load() {
      this.busy = true;
      try {
        const [shelves, tanks, detections, sensorTypes] = await Promise.all([shelvesApi.list(), tanksApi.list(), detectionsApi.list(), sensorsApi.sensorTypes().catch(() => ({data: []}))]);
        this.shelves = shelves.data;
        this.tanks = tanks.data;
        this.detections = detections.data;
        this.sensorTypes = sensorTypes.data;
        if (!this.selectedShelfId && this.shelves[0]) this.selectedShelfId = this.shelves[0].id;
        await this.loadShelfData();
      } finally {
        this.busy = false;
      }
    },
    async loadShelfData() {
      if (!this.selectedShelfId) return;
      const [sensors, readings] = await Promise.all([sensorsApi.sensors({shelf_id: this.selectedShelfId}).catch(() => ({data: []})), sensorsApi.latest({shelf_id: this.selectedShelfId}).catch(() => ({data: []}))]);
      this.sensors = sensors.data;
      this.latestReadingsForShelf = readings.data;
    },
    selectShelf(id) {
      this.selectedShelfId = id;
    },
    openShelf(shelf = null) {
      this.shelfForm = shelf ? {...shelf} : {code: "", name: "", status: "active", description: ""};
      this.$bvModal.show("shelf-modal");
    },
    async saveShelf() {
      if (this.shelfForm.id) await shelvesApi.update(this.shelfForm.id, this.shelfForm);
      else await shelvesApi.create(this.shelfForm);
      await this.load();
    },
    async setMaintenance(shelf) {
      await shelvesApi.maintenance(shelf.id);
      await this.load();
    },
    async activateShelf(shelf) {
      await shelvesApi.activate(shelf.id);
      await this.load();
    },
    openTank(tank = null) {
      this.tankForm = tank
        ? {...tank}
        : {
            shelf_id: this.selectedShelfId,
            code: "",
            name: "",
            status: "empty",
            level_index: 0,
            row_index: 0,
            col_index: 0,
            x_position: 0,
            y_position: 0,
            z_position: 0,
          };
      this.$bvModal.show("tank-modal");
    },
    async saveTank() {
      if (this.tankForm.id) await tanksApi.update(this.tankForm.id, this.tankForm);
      else await tanksApi.create(this.tankForm);
      await this.load();
    },
    async deleteTank(tank) {
      if (!window.confirm(`Delete tank ${tank.code}?`)) return;
      await tanksApi.remove(tank.id);
      await this.load();
    },
    async scanTank(tank) {
      const key = `scan-${tank.id}`;
      this.setActionBusy(key, true);
      try {
        await scansApi.runTank(tank.id);
        this.$bvToast.toast("Scan job queued", {title: tank.code, variant: "info", solid: true});
      } finally {
        this.setActionBusy(key, false);
      }
    },
    async moveToTank(tank) {
      const key = `move-${tank.id}`;
      this.setActionBusy(key, true);
      try {
        await motionApi.moveToTank(tank.id, {speed: 3000});
        this.$bvToast.toast("Move command sent", {title: tank.code, variant: "info", solid: true});
      } finally {
        this.setActionBusy(key, false);
      }
    },
    setActionBusy(key, value) {
      this.$set(this.actionBusy, key, value);
    },
    isActionBusy(key) {
      return Boolean(this.actionBusy[key]);
    },
    latestDetection(tank) {
      return this.detections.find((detection) => detection.tank_id === tank.id) || {};
    },
    latestReadings(tank) {
      return this.latestReadingsForShelf.filter((reading) => reading.tank_id === tank.id);
    },
    sensorLabel(sensorId) {
      const sensor = this.sensors.find((item) => item.id === sensorId);
      const type = sensor && this.sensorTypes.find((item) => item.id === sensor.sensor_type_id);
      return type ? type.code : "sensor";
    },
    applyRealtimeEvent(event) {
      const data = event.data || {};
      if (event.event === "shelf_created" || event.event === "shelf_updated") this.mergeById(this.shelves, data);
      if (event.event === "tank_created" || event.event === "tank_updated") this.mergeById(this.tanks, data);
      if (event.event === "detection_created") this.mergeById(this.detections, data);
      if (event.event === "sensor_reading_created") this.mergeById(this.latestReadingsForShelf, data);
      if (event.event === "sensor_alert_created") this.loadShelfData();
    },
    mergeById(list, item) {
      if (!item.id) return;
      const index = list.findIndex((existing) => existing.id === item.id);
      if (index === -1) list.unshift(item);
      else this.$set(list, index, {...list[index], ...item});
    },
  },
};
</script>

<style scoped>
.farm-sidebar {
  min-height: 520px;
}

.shelf-row {
  align-items: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  color: #d7dae3;
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  padding: 9px;
  text-align: left;
  width: 100%;
}

.shelf-row small {
  color: #9aa0ad;
  display: block;
}

.shelf-row.active,
.shelf-row:hover {
  background: #1b1e27;
  border-color: #44d7cf;
}

.info-list {
  display: grid;
  grid-template-columns: 140px 1fr;
  row-gap: 8px;
}

.info-list dt {
  color: #9aa0ad;
}

.tank-toolbar {
  gap: 10px;
}

.tank-toolbar .form-group {
  margin-bottom: 0;
  min-width: 130px;
}

.layout-level {
  margin-bottom: 18px;
}

.level-title {
  color: #9aa0ad;
  font-size: 12px;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.tank-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
}

.tank-card {
  background: #181a22;
  border: 1px solid #3a3d46;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-height: 130px;
  padding: 10px;
}

.tank-code {
  font-weight: 700;
}

.status-normal {
  border-color: #44d7cf;
}
.status-molting {
  border-color: #f6c65b;
}
.status-soft_shell {
  border-color: #ff8a5c;
}
.status-empty {
  border-color: #565b68;
  opacity: 0.82;
}
.status-error {
  border-color: #ff5b62;
}
.status-harvested {
  border-color: #8ab4ff;
}
</style>
