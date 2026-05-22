<template>
  <div>
    <b-alert
      v-if="$store.state.simulationMode"
      show
      variant="warning"
      class="simulation-banner"
    >
      SIMULATION MODE - scan jobs/items are marked simulated and hardware
      success is not implied.
    </b-alert>

    <b-row>
      <b-col md="3" sm="6">
        <StatusCard
          label="Server"
          :value="serverState"
          :tone="serverOk ? 'ok' : 'danger'"
          detail="FastAPI health"
        />
      </b-col>
      <b-col md="3" sm="6">
        <StatusCard
          label="MQTT"
          :value="mqttState"
          :tone="mqttConnected ? 'ok' : 'warn'"
          detail="Broker bridge"
        />
      </b-col>
      <b-col md="3" sm="6">
        <StatusCard
          label="WebSocket"
          :value="$store.state.realtimeConnected ? 'Connected' : 'Disconnected'"
          :tone="$store.state.realtimeConnected ? 'ok' : 'warn'"
          detail="Realtime events"
        />
      </b-col>
      <b-col md="3" sm="6">
        <StatusCard
          label="Active Shelves"
          :value="activeShelves"
          detail="Operational shelves"
        />
      </b-col>
      <b-col md="3" sm="6">
        <StatusCard
          label="Total Tanks"
          :value="allTanks.length"
          detail="Registered tanks"
        />
      </b-col>
      <b-col md="3" sm="6">
        <StatusCard
          label="Normal / Molting"
          :value="`${statusCount('normal')} / ${statusCount('molting')}`"
          detail="Tank status"
        />
      </b-col>
      <b-col md="3" sm="6">
        <StatusCard
          label="Soft / Error"
          :value="`${statusCount('soft_shell')} / ${statusCount('error')}`"
          tone="warn"
          detail="Needs attention"
        />
      </b-col>
      <b-col md="3" sm="6">
        <StatusCard
          label="Open Sensor Alerts"
          :value="openAlerts.length"
          :tone="openAlerts.length ? 'warn' : 'ok'"
          detail="Water quality alerts"
        />
      </b-col>
    </b-row>

    <div class="panel">
      <div class="panel-header">Camera Status</div>
      <div class="panel-body">
        <b-row>
          <b-col v-for="device in cameraDevices" :key="device.id" md="3" sm="6">
            <StatusCard
              :label="device.code"
              :value="effectiveDeviceStatus(device)"
              :tone="deviceTone(effectiveDeviceStatus(device))"
              :detail="cameraDetail(device)"
            />
          </b-col>
        </b-row>
        <div v-if="!cameraDevices.length" class="text-muted py-2">No camera devices</div>
      </div>
    </div>

    <b-row>
      <b-col lg="6">
        <div class="panel">
          <div class="panel-header">Current Scan Jobs {{ allJobs.length }}</div>
          <div class="panel-body">
            <DataTable :items="allJobs.slice(0, 8)" :fields="jobFields" />
          </div>
        </div>
        <div class="panel">
          <div class="panel-header">Latest Sensor Readings</div>
          <div class="panel-body">
            <DataTable
              :items="allReadings.slice(0, 8)"
              :fields="readingFields"
            />
          </div>
        </div>
        <div class="panel">
          <div class="panel-header">Recent Detections</div>
          <div class="panel-body">
            <DataTable
              :items="allDetections.slice(0, 8)"
              :fields="detectionFields"
            />
          </div>
        </div>
      </b-col>
      <b-col lg="6">
        <div class="panel">
          <div class="panel-header">Auto Schedules Active</div>
          <div class="panel-body">
            <DataTable
              :items="activeAutoSchedules.slice(0, 8)"
              :fields="scheduleFields"
            />
          </div>
        </div>
        <div class="panel">
          <div class="panel-header">Recent MQTT Logs</div>
          <div class="panel-body">
            <DataTable :items="allMqttLogs.slice(0, 8)" :fields="mqttFields" />
          </div>
        </div>
        <div class="panel">
          <div class="panel-header">Open Sensor Alerts</div>
          <div class="panel-body">
            <DataTable :items="openAlerts.slice(0, 8)" :fields="alertFields" />
          </div>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import api from "../api/axios";
import shelvesApi from "../api/shelves";
import tanksApi from "../api/tanks";
import detectionsApi from "../api/detections";
import scansApi from "../api/scans";
import mqttLogsApi from "../api/mqttLogs";
import sensorsApi from "../api/sensors";
import devicesApi from "../api/devices";
import StatusCard from "../components/StatusCard.vue";
import DataTable from "../components/DataTable.vue";

export default {
  name: "Dashboard",
  components: { StatusCard, DataTable },
  data() {
    return {
      health: null,
      shelves: [],
      tanks: [],
      detections: [],
      jobs: [],
      schedules: [],
      mqttLogs: [],
      readings: [],
      alerts: [],
      devices: [],
      jobFields: [
        "status",
        "job_type",
        "total_tanks",
        "completed_tanks",
        "failed_tanks",
        "created_at",
      ],
      readingFields: [
        "sensor_id",
        "tank_id",
        "shelf_id",
        "value",
        "unit",
        "measured_at",
      ],
      detectionFields: [
        "tank_id",
        "class_name",
        "confidence",
        "action",
        "detected_at",
      ],
      scheduleFields: [
        "name",
        "tag",
        "schedule_type",
        "scan_mode",
        "auto_reason",
        "next_run_at",
        "run_count",
      ],
      mqttFields: ["direction", "topic", "created_at"],
      alertFields: [
        "sensor_id",
        "tank_id",
        "alert_type",
        "message",
        "status",
        "created_at",
      ],
    };
  },
  computed: {
    serverOk() {
      return this.health && this.health.status === "ok";
    },
    serverState() {
      return this.serverOk ? "Online" : "Offline";
    },
    mqttConnected() {
      return Boolean(this.health && this.health.mqtt_connected);
    },
    mqttState() {
      return this.mqttConnected ? "Connected" : "Unknown";
    },
    allShelves() {
      return this.mergeById(this.shelves, this.$store.state.shelves);
    },
    allTanks() {
      return this.mergeById(this.tanks, this.$store.state.tanks);
    },
    allJobs() {
      return this.sortByCreatedAtDesc(
        this.mergeById(this.jobs, this.$store.state.scanJobs)
      );
    },
    allSchedules() {
      return this.mergeById(this.schedules, this.$store.state.scanSchedules);
    },
    allDetections() {
      return this.mergeById(this.detections, this.$store.state.detections);
    },
    allMqttLogs() {
      return this.sortByCreatedAtDesc(
        this.mergeById(this.mqttLogs, this.$store.state.mqttLogs)
      );
    },
    allReadings() {
      return this.mergeById(this.readings, this.$store.state.sensorReadings);
    },
    allAlerts() {
      return this.mergeById(this.alerts, this.$store.state.sensorAlerts);
    },
    allDevices() {
      return this.mergeById(this.devices, this.$store.state.devices);
    },
    cameraDevices() {
      return this.allDevices.filter((device) => device.type === "pi_camera");
    },
    activeShelves() {
      return this.allShelves.filter((shelf) => shelf.status === "active")
        .length;
    },
    openAlerts() {
      return this.allAlerts.filter((alert) => alert.status === "open");
    },
    activeAutoSchedules() {
      return this.allSchedules.filter(
        (schedule) => schedule.tag === "AUTO" && schedule.is_active
      );
    },
  },
  created() {
    this.load();
  },
  methods: {
    async load() {
      const results = await Promise.allSettled([
        api.get("/health", { skipGlobalLoading: true }),
        shelvesApi.list(),
        tanksApi.list(),
        detectionsApi.list(),
        scansApi.jobsV2(),
        scansApi.schedules(),
        mqttLogsApi.list(100),
        sensorsApi.readings({ limit: 100 }),
        sensorsApi.alerts(),
        devicesApi.list(),
      ]);
      this.health = results[0].value && results[0].value.data;
      this.shelves = results[1].value ? results[1].value.data : [];
      this.tanks = results[2].value ? results[2].value.data : [];
      this.detections = results[3].value ? results[3].value.data : [];
      this.jobs = results[4].value ? results[4].value.data : [];
      this.schedules = results[5].value ? results[5].value.data : [];
      this.mqttLogs = results[6].value ? results[6].value.data : [];
      this.readings = results[7].value ? results[7].value.data : [];
      this.alerts = results[8].value ? results[8].value.data : [];
      this.devices = results[9].value ? results[9].value.data : [];
      this.$store.commit(
        "setSimulationMode",
        Boolean(this.health && this.health.simulation_mode)
      );
    },
    statusCount(status) {
      return this.allTanks.filter((tank) => tank.status === status).length;
    },
    mergeById(base, realtime) {
      const map = new Map();
      [...base, ...realtime].forEach((item) => {
        if (!item || !item.id) return;
        map.set(item.id, { ...(map.get(item.id) || {}), ...item });
      });
      return Array.from(map.values());
    },
    sortByCreatedAtDesc(items) {
      return [...items].sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );
    },
    effectiveDeviceStatus(device) {
      if (!device) return "offline";
      if (device.status !== "online") return device.status || "offline";
      if (!device.last_seen_at) return "offline";
      const ageSeconds = (Date.now() - new Date(device.last_seen_at).getTime()) / 1000;
      return ageSeconds > 60 ? "offline" : "online";
    },
    deviceTone(status) {
      if (status === "online") return "ok";
      if (status === "error") return "danger";
      return "warn";
    },
    cameraDetail(device) {
      const latest = device.metadata && device.metadata.latest_status ? device.metadata.latest_status : "unknown";
      const seen = device.last_seen_at ? this.formatDateTime(device.last_seen_at) : "never";
      return `latest: ${latest} / last seen: ${seen}`;
    },
    formatDateTime(value) {
      if (!value) return "";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return value;
      return date.toLocaleString();
    },
  },
};
</script>

<style scoped>
.simulation-banner {
  border-radius: 6px;
  font-weight: 700;
}
</style>
