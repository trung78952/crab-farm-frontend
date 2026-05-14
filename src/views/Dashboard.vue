<template>
  <div>
    <b-alert v-if="$store.state.simulationMode" show variant="warning" class="simulation-banner">
      SIMULATION MODE - jobs are marked simulated and hardware success is not implied.
    </b-alert>
    <b-row>
      <b-col md="3" sm="6"
        ><StatusCard
          label="Server"
          value="Online"
          tone="ok"
          detail="FastAPI reachable"
      /></b-col>
      <b-col md="3" sm="6"
        ><StatusCard
          label="MQTT"
          :value="mqttState"
          :tone="mqttTone"
          detail="Broker bridge"
      /></b-col>
      <b-col md="3" sm="6"
        ><StatusCard
          label="Motion"
          :value="motionState"
          detail="Controller status"
      /></b-col>
      <b-col md="3" sm="6"
        ><StatusCard
          label="Camera"
          :value="cameraState"
          detail="Pi camera devices"
      /></b-col>
      <b-col md="3" sm="6"
        ><StatusCard
          label="Total Tanks"
          :value="tanks.length"
          detail="Registered tanks"
      /></b-col>
      <b-col md="3" sm="6"
        ><StatusCard
          label="Need Harvest"
          :value="harvestReady"
          tone="warn"
          detail="Soft-shell status"
      /></b-col>
      <b-col md="3" sm="6"
        ><StatusCard
          label="Current Scan"
          :value="currentScan"
          detail="Latest scan job"
      /></b-col>
      <b-col md="3" sm="6"
        ><StatusCard
          label="Last Detection"
          :value="lastDetection"
          detail="Detection pipeline"
      /></b-col>
    </b-row>

    <b-row>
      <b-col lg="6">
        <div class="panel">
          <div class="panel-header">Recent Detections</div>
          <div class="panel-body">
            <DataTable
              :items="realtimeDetections.slice(0, 6)"
              :fields="detectionFields"
            />
          </div>
        </div>
        <div class="panel">
          <div class="panel-header">Recent Motion Commands</div>
          <div class="panel-body">
            <DataTable :items="commands.slice(0, 6)" :fields="commandFields" />
          </div>
        </div>
      </b-col>
      <b-col lg="6">
        <div class="panel">
          <div class="panel-header">MQTT Logs</div>
          <div class="panel-body">
            <DataTable :items="realtimeMqttLogs.slice(0, 6)" :fields="mqttFields" />
          </div>
        </div>
        <div class="panel">
          <div class="panel-header">System Console</div>
          <div class="panel-body">
            <div class="console-panel">{{ consoleText }}</div>
          </div>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import api from "../api/axios";
import tanksApi from "../api/tanks";
import devicesApi from "../api/devices";
import detectionsApi from "../api/detections";
import motionApi from "../api/motion";
import scansApi from "../api/scans";
import mqttLogsApi from "../api/mqttLogs";
import StatusCard from "../components/StatusCard.vue";
import DataTable from "../components/DataTable.vue";

export default {
  name: "Dashboard",
  components: { StatusCard, DataTable },
  data() {
    return {
      health: null,
      tanks: [],
      devices: [],
      detections: [],
      commands: [],
      jobs: [],
      mqttLogs: [],
      detectionFields: [
        "tank_id",
        "class_name",
        "confidence",
        "action",
        "detected_at",
      ],
      commandFields: ["cmd_id", "command_type", "status", "created_at"],
      mqttFields: ["direction", "topic", "created_at"],
    };
  },
  computed: {
    mqttState() {
      return this.health && this.health.mqtt_connected
        ? "Connected"
        : "Unknown";
    },
    mqttTone() {
      return this.health && this.health.mqtt_connected ? "ok" : "warn";
    },
    motionState() {
      const item = this.devices.find((d) => d.type === "esp32_motion");
      return item ? item.status : "Unknown";
    },
    cameraState() {
      const item = this.devices.find((d) => d.type === "pi_camera");
      return item ? item.status : "Unknown";
    },
    harvestReady() {
      return this.tanks.filter((t) => t.status === "soft_shell").length;
    },
    currentScan() {
      const job = this.realtimeJobs[0] || this.jobs[0]
      return job ? job.status : "None";
    },
    lastDetection() {
      const detection = this.realtimeDetections[0] || this.detections[0]
      return detection ? detection.class_name : "None";
    },
    realtimeMqttLogs() {
      return this.$store.state.mqttLogs.concat(this.mqttLogs)
    },
    realtimeDetections() {
      return this.$store.state.detections.concat(this.detections)
    },
    realtimeJobs() {
      return this.$store.state.scanJobs.concat(this.jobs)
    },
    consoleText() {
      const lines = [
        "[system] dashboard online",
        `[tanks] ${this.tanks.length} tanks loaded`,
        `[scan] ${this.jobs.length} jobs indexed`,
        `[mqtt] ${this.mqttLogs.length} recent messages`,
      ];
      return lines.join("\n");
    },
  },
  created() {
    this.load();
  },
  methods: {
    async load() {
      const results = await Promise.allSettled([
        api.get("/health"),
        tanksApi.list(),
        devicesApi.list(),
        detectionsApi.list(),
        motionApi.commands(),
        scansApi.jobs(),
        mqttLogsApi.list(50),
      ]);
      this.health = results[0].value && results[0].value.data;
      this.tanks = results[1].value ? results[1].value.data : [];
      this.devices = results[2].value ? results[2].value.data : [];
      this.detections = results[3].value ? results[3].value.data : [];
      this.commands = results[4].value ? results[4].value.data : [];
      this.jobs = results[5].value ? results[5].value.data : [];
      this.mqttLogs = results[6].value ? results[6].value.data : [];
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
