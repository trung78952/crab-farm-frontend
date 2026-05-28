<template>
  <b-row>
    <b-col lg="5">
      <div class="panel">
        <div class="panel-header">Motion Control</div>
        <div class="panel-body">
          <b-form-row>
            <b-col md="6">
              <b-form-group label="Shelf">
                <b-form-select v-model="selectedShelfId" :options="shelfOptions" />
              </b-form-group>
            </b-col>
            <b-col md="6">
              <b-form-group label="Motion Device">
                <b-form-select v-model="selectedDeviceId" :options="deviceOptions" />
              </b-form-group>
            </b-col>
          </b-form-row>

          <dl class="motion-target mb-3">
            <dt>Device</dt>
            <dd>{{ selectedDevice ? selectedDevice.code : "Default FluidNC" }}</dd>
            <dt>Target</dt>
            <dd>{{ targetText }}</dd>
            <dt>Protocol</dt>
            <dd>{{ protocolText }}</dd>
          </dl>

          <div class="mb-3 d-flex flex-wrap">
            <b-button variant="primary" class="mr-2 mb-2" @click="home">
              <i class="fas fa-home mr-1"></i>Home
            </b-button>
            <b-button variant="outline-info" class="mr-2 mb-2" @click="unlock">
              <i class="fas fa-lock-open mr-1"></i>Unlock $X
            </b-button>
            <b-button variant="outline-light" class="mr-2 mb-2" @click="queryStatus">
              <i class="fas fa-circle-question mr-1"></i>Query Status
            </b-button>
            <b-button variant="outline-warning" class="mr-2 mb-2" @click="cameraRetract">
              <i class="fas fa-arrow-left mr-1"></i>Camera Retract
            </b-button>
            <b-button variant="danger" class="mb-2" @click="emergencyStop">
              <i class="fas fa-triangle-exclamation mr-1"></i>Emergency Stop
            </b-button>
          </div>

          <b-form-group label="Move To Tank">
            <b-input-group>
              <b-form-select v-model="tankId" :options="tankOptions" />
              <b-input-group-append>
                <b-button variant="outline-info" @click="move">Move</b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>

          <b-form-group label="G-code">
            <b-form-textarea v-model="gcode" rows="7" />
          </b-form-group>
          <b-form-checkbox v-model="waitForIdle" class="mb-3">Wait for Idle</b-form-checkbox>
          <b-button variant="outline-info" @click="sendGcode">
            <i class="fas fa-paper-plane mr-1"></i>Send G-code
          </b-button>
        </div>
      </div>
    </b-col>

    <b-col lg="7">
      <div class="panel">
        <div class="panel-header">Command History</div>
        <div class="panel-body">
          <DataTable style="max-height: 50vh;" :items="commands" :fields="fields">
            <template #status="{ item }">
              <b-badge :variant="statusVariant(item.status)">{{ item.status }}</b-badge>
            </template>
            <template #target="{ item }">
              <span v-if="item.target_host">{{ item.target_host }}:{{ item.target_port }}</span>
              <span v-else class="text-muted">-</span>
            </template>
            <template #responses="{ item }">
              <b-button size="sm" variant="outline-info" @click="showResponses(item)">
                <i class="fas fa-terminal mr-1"></i>Log
              </b-button>
            </template>
          </DataTable>
        </div>
      </div>
      <div class="console-panel">{{ consoleText }}</div>
    </b-col>

    <b-modal id="motion-response-modal" title="Motion Response Log" size="lg" ok-only>
      <pre class="response-log">{{ responseLogText }}</pre>
    </b-modal>
  </b-row>
</template>

<script>
import DataTable from "../components/DataTable.vue";
import motionApi from "../api/motion";
import devicesApi from "../api/devices";
import shelvesApi from "../api/shelves";
import tanksApi from "../api/tanks";

export default {
  name: "Motion",
  components: { DataTable },
  data() {
    return {
      selectedDeviceId: "",
      selectedShelfId: "",
      tankId: "",
      gcode: "$X\nG91\nG0 X5 F300\nG0 X-5 F300\nG90",
      waitForIdle: true,
      commands: [],
      devices: [],
      shelves: [],
      tanks: [],
      selectedCommand: null,
      fields: [
        "cmd_id",
        "command_type",
        "status",
        "transport",
        { key: "target", label: "target" },
        "created_at",
        "completed_at",
        { key: "responses", label: "responses" },
      ],
    };
  },
  computed: {
    selectedDevice() {
      return this.devices.find((device) => device.id === this.selectedDeviceId);
    },
    targetText() {
      const metadata = (this.selectedDevice && this.selectedDevice.metadata) || {};
      const host = metadata.ip || metadata.host || "192.168.1.3";
      const port = metadata.port || 23;
      return `${host}:${port}`;
    },
    protocolText() {
      const metadata = (this.selectedDevice && this.selectedDevice.metadata) || {};
      return metadata.protocol || (this.selectedDevice && this.selectedDevice.type === "fluidnc_controller" ? "fluidnc_telnet" : "mqtt");
    },
    deviceOptions() {
      return [
        { value: "", text: "Default FluidNC" },
        ...this.devices
          .filter((device) => ["fluidnc_controller", "esp32_motion"].includes(device.type))
          .map((device) => ({ value: device.id, text: `${device.code} (${device.type})` })),
      ];
    },
    shelfOptions() {
      return [{ value: "", text: "No shelf filter" }, ...this.shelves.map((shelf) => ({ value: shelf.id, text: shelf.code }))];
    },
    tankOptions() {
      return [
        { value: "", text: "Select tank" },
        ...this.tanks
          .filter((tank) => !this.selectedShelfId || tank.shelf_id === this.selectedShelfId)
          .map((tank) => ({ value: tank.id, text: `${tank.code} (${tank.id})` })),
      ];
    },
    consoleText() {
      return this.commands
        .slice(0, 12)
        .map((command) => `[${command.status}] ${command.cmd_id} ${command.command_type} ${command.transport || ""}`)
        .join("\n");
    },
    responseLogText() {
      if (!this.selectedCommand) return "";
      return JSON.stringify(this.selectedCommand.response_log || this.selectedCommand.mqtt_response || [], null, 2);
    },
  },
  watch: {
    "$store.state.events.length"() {
      const event = this.$store.state.events[0];
      if (!event || !["motion_command_created", "motion_command_updated"].includes(event.event)) return;
      this.mergeCommand(event.data);
    },
  },
  created() {
    this.$store.dispatch("startRealtime");
    this.load();
  },
  methods: {
    async load() {
      const [commands, devices, shelves, tanks] = await Promise.all([
        motionApi.commands(),
        devicesApi.list(),
        shelvesApi.list(),
        tanksApi.list(),
      ]);
      this.commands = commands.data;
      this.devices = devices.data;
      this.shelves = shelves.data;
      this.tanks = tanks.data;
    },
    requestParams() {
      const params = {};
      if (this.selectedDeviceId) params.device_id = this.selectedDeviceId;
      if (this.selectedShelfId) params.shelf_id = this.selectedShelfId;
      return params;
    },
    async home() {
      await motionApi.home(this.requestParams());
      await this.load();
    },
    async unlock() {
      await motionApi.unlock(this.requestParams());
      await this.load();
    },
    async queryStatus() {
      const res = await motionApi.status(this.requestParams());
      this.$bvToast.toast(JSON.stringify(res.data.parsed || res.data.raw), {
        title: "FluidNC Status",
        variant: res.data.status === "ok" ? "info" : "danger",
        solid: true,
      });
      await this.load();
    },
    async cameraRetract() {
      await motionApi.cameraRetract(this.requestParams());
      await this.load();
    },
    async emergencyStop() {
      await motionApi.emergencyStop(this.requestParams());
      await this.load();
    },
    async move() {
      if (!this.tankId) return;
      await motionApi.moveToTank(this.tankId, { speed: 1500 });
      await this.load();
    },
    async sendGcode() {
      const payload = {
        lines: this.gcode.split("\n").map((line) => line.trim()).filter(Boolean),
        wait_for_idle: this.waitForIdle,
        device_id: this.selectedDeviceId || null,
        shelf_id: this.selectedShelfId || null,
      };
      await motionApi.gcode(payload);
      await this.load();
    },
    showResponses(command) {
      this.selectedCommand = command;
      this.$bvModal.show("motion-response-modal");
    },
    mergeCommand(command) {
      if (!command || !command.id) return;
      const index = this.commands.findIndex((item) => item.id === command.id);
      if (index === -1) this.commands.unshift(command);
      else this.$set(this.commands, index, { ...this.commands[index], ...command });
    },
    statusVariant(status) {
      if (status === "done") return "success";
      if (status === "failed" || status === "timeout" || status === "cancelled") return "danger";
      if (status === "running" || status === "sent") return "info";
      if (status === "simulated") return "warning";
      return "secondary";
    },
  },
};
</script>

<style scoped>
.motion-target {
  display: grid;
  grid-template-columns: 90px 1fr;
  column-gap: 12px;
  row-gap: 4px;
}

.motion-target dt,
.motion-target dd {
  margin-bottom: 0;
}

.response-log {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 6px;
  padding: 12px;
  white-space: pre-wrap;
}
</style>
