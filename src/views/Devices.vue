<template>
  <div>
    <div class="panel">
      <div class="panel-header d-flex justify-content-between align-items-center">
        <span>Devices</span>
        <b-button size="sm" variant="primary" @click="openCreate">
          <i class="fas fa-plus mr-1"></i>Create
        </b-button>
      </div>
      <div class="panel-body">
        <b-form-row class="mb-3">
          <b-col md="4">
            <b-form-group label="Type">
              <b-form-select v-model="filters.type" :options="typeFilterOptions" />
            </b-form-group>
          </b-col>
          <b-col md="4">
            <b-form-group label="Status">
              <b-form-select v-model="filters.status" :options="statusFilterOptions" />
            </b-form-group>
          </b-col>
          <b-col md="4">
            <b-form-group label="Shelf">
              <b-form-select v-model="filters.shelf_id" :options="shelfFilterOptions" />
            </b-form-group>
          </b-col>
        </b-form-row>

        <DataTable :items="displayDevices" :fields="fields">
          <template #status="{ item }">
            <b-badge :variant="statusVariant(item.effective_status)">
              {{ item.effective_status }}
            </b-badge>
          </template>
          <template #token_status="{ item }">
            <b-badge :variant="tokenVariant(item.token_status)">
              {{ item.token_status }}
            </b-badge>
          </template>
          <template #token_preview="{ item }">
            <span v-if="item.token_preview">{{ item.token_preview }}</span>
            <span v-else class="text-muted">-</span>
          </template>
          <template #stream_url="{ item }">
            <a v-if="item.stream_url" :href="item.stream_url" target="_blank" rel="noopener">{{ item.stream_url }}</a>
            <span v-else class="text-muted">-</span>
          </template>
          <template #metadata="{ item }">
            <b-button size="sm" variant="outline-info" @click="showMetadata(item)">
              <i class="fas fa-code mr-1"></i>JSON
            </b-button>
          </template>
          <template #actions="{ item }">
            <b-button size="sm" variant="outline-light" class="mr-1" @click="openEdit(item)">
              <i class="fas fa-pen"></i>
            </b-button>
            <b-button size="sm" variant="outline-success" class="mr-1" @click="issueToken(item)">
              <i class="fas fa-key"></i>
            </b-button>
            <b-button size="sm" variant="outline-info" class="mr-1" @click="rotateToken(item)">
              <i class="fas fa-rotate"></i>
            </b-button>
            <b-button size="sm" variant="outline-danger" class="mr-1" @click="revokeToken(item)">
              <i class="fas fa-ban"></i>
            </b-button>
            <b-button size="sm" variant="outline-secondary" class="mr-1" @click="showSetupGuide(item)">
              <i class="fas fa-circle-info"></i>
            </b-button>
            <b-button size="sm" variant="outline-warning" @click="retire(item)">
              <i class="fas fa-box-archive"></i>
            </b-button>
          </template>
        </DataTable>
      </div>
    </div>

    <b-modal id="device-modal" :title="editing ? 'Edit Device' : 'Create Device'" @ok.prevent="saveDevice">
      <b-form @submit.prevent="saveDevice">
        <b-form-row>
          <b-col md="6">
            <b-form-group label="Code">
              <b-form-input v-model.trim="form.code" required />
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group label="Type">
              <b-form-select v-model="form.type" :options="deviceTypeOptions" required />
            </b-form-group>
          </b-col>
        </b-form-row>
        <b-form-group label="Name">
          <b-form-input v-model.trim="form.name" required />
        </b-form-group>
        <b-form-row>
          <b-col md="6">
            <b-form-group label="Shelf">
              <b-form-select v-model="form.shelf_id" :options="shelfFormOptions" />
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group label="Status">
              <b-form-select v-model="form.status" :options="deviceStatusOptions" />
            </b-form-group>
          </b-col>
        </b-form-row>
        <b-form-group label="MQTT Client ID">
          <b-form-input v-model.trim="form.mqtt_client_id" />
        </b-form-group>
        <b-form-group label="Stream URL">
          <b-form-input v-model.trim="form.stream_url" />
        </b-form-group>
        <b-form-group label="Metadata JSON">
          <b-form-textarea v-model="metadataText" rows="6" max-rows="12" />
        </b-form-group>
      </b-form>
    </b-modal>

    <b-modal id="metadata-modal" title="Device Metadata" ok-only>
      <JsonViewer :value="selectedMetadata" />
    </b-modal>

    <b-modal id="device-token-modal" :title="issuedTokenTitle" hide-footer @hidden="clearIssuedToken">
      <div v-if="issuedToken">
        <dl class="row mb-3">
          <dt class="col-sm-4">Device Code</dt>
          <dd class="col-sm-8">{{ issuedToken.device_code }}</dd>
          <dt class="col-sm-4">Device Token</dt>
          <dd class="col-sm-8">
            <b-form-input :value="issuedToken.device_token" readonly />
          </dd>
          <dt class="col-sm-4">Preview</dt>
          <dd class="col-sm-8">{{ issuedToken.token_preview }}</dd>
        </dl>
        <b-alert show variant="warning">
          Token này chỉ hiển thị một lần. Hãy copy hoặc tải file .env ngay bây giờ.
        </b-alert>
        <div class="d-flex flex-wrap">
          <b-button variant="primary" class="mr-2 mb-2" @click="copyToken">
            <i class="fas fa-copy mr-1"></i>Copy Token
          </b-button>
          <b-button variant="outline-light" class="mr-2 mb-2" @click="downloadEnv">
            <i class="fas fa-download mr-1"></i>Download .env
          </b-button>
          <b-button variant="secondary" class="mb-2" @click="$bvModal.hide('device-token-modal')">
            Close
          </b-button>
        </div>
      </div>
    </b-modal>

    <b-modal id="setup-guide-modal" title="Device Setup Guide" size="lg" ok-only>
      <div v-if="guideDevice">
        <ol class="pl-3">
          <li>Tạo device {{ guideDevice.code }} trên dashboard.</li>
          <li>Bấm Issue Token.</li>
          <li>Copy token vào Raspberry Pi .env.</li>
          <li>Sửa camera_node.py để upload dùng headers X-Device-Code và X-Device-Token.</li>
          <li>Restart service: <code>sudo systemctl restart crab-camera-node</code></li>
          <li>Kiểm tra: <code>sudo journalctl -u crab-camera-node -f</code></li>
        </ol>
        <pre class="setup-env-preview">{{ setupGuideEnv }}</pre>
        <b-alert show variant="info">
          Không dùng JWT user token cho device chạy 24/7. Nếu rotate token thì phải cập nhật lại .env trên Pi. Nếu revoke token thì Pi sẽ bị 401 khi upload.
        </b-alert>
      </div>
    </b-modal>
  </div>
</template>

<script>
import DataTable from "../components/DataTable.vue";
import JsonViewer from "../components/JsonViewer.vue";
import devicesApi from "../api/devices";
import shelvesApi from "../api/shelves";

const DEVICE_TYPES = [
  "pi_camera",
  "esp32_motion",
  "server",
  "sensor_node",
  "fluidnc_controller",
];
const DEVICE_STATUSES = ["online", "offline", "error", "maintenance"];
const OFFLINE_AFTER_SECONDS = 60;

export default {
  name: "Devices",
  components: { DataTable, JsonViewer },
  data() {
    return {
      devices: [],
      shelves: [],
      filters: { type: "", status: "", shelf_id: "" },
      form: this.blankForm(),
      metadataText: "{}",
      editing: null,
      selectedMetadata: {},
      issuedToken: null,
      issuedTokenDevice: null,
      issuedTokenTitle: "Device Token Created",
      guideDevice: null,
      fields: [
        { key: "shelf_code", label: "shelf" },
        "code",
        "type",
        "name",
        "status",
        { key: "token_status", label: "token" },
        { key: "token_preview", label: "preview" },
        "token_last_used_at",
        "mqtt_client_id",
        "stream_url",
        "last_seen_at",
        { key: "latest_status", label: "latest status" },
        "metadata",
        "actions",
      ],
    };
  },
  computed: {
    allDevices() {
      return this.mergeById(this.devices, this.$store.state.devices);
    },
    displayDevices() {
      return this.allDevices
        .map((device) => ({
          ...device,
          shelf_code: this.shelfCode(device.shelf_id),
          effective_status: this.effectiveStatus(device),
          token_status: this.tokenStatus(device),
          latest_status: device.metadata && device.metadata.latest_status ? device.metadata.latest_status : "-",
        }))
        .filter((device) => !this.filters.type || device.type === this.filters.type)
        .filter((device) => !this.filters.status || device.effective_status === this.filters.status)
        .filter((device) => !this.filters.shelf_id || device.shelf_id === this.filters.shelf_id);
    },
    deviceTypeOptions() {
      return DEVICE_TYPES.map((value) => ({ value, text: value }));
    },
    deviceStatusOptions() {
      return DEVICE_STATUSES.map((value) => ({ value, text: value }));
    },
    typeFilterOptions() {
      return [{ value: "", text: "All types" }, ...this.deviceTypeOptions];
    },
    statusFilterOptions() {
      return [{ value: "", text: "All statuses" }, ...this.deviceStatusOptions];
    },
    shelfFilterOptions() {
      return [{ value: "", text: "All shelves" }, ...this.shelves.map((shelf) => ({ value: shelf.id, text: shelf.code }))];
    },
    shelfFormOptions() {
      return [{ value: null, text: "No shelf" }, ...this.shelves.map((shelf) => ({ value: shelf.id, text: shelf.code }))];
    },
    setupGuideEnv() {
      if (!this.guideDevice) return "";
      return [
        `DEVICE_CODE=${this.guideDevice.code}`,
        `DEVICE_ID=${this.guideDevice.id}`,
        "DEVICE_TOKEN=<token from Issue Token modal>",
        `SHELF_CODE=${this.shelfCodeValue(this.guideDevice.shelf_id)}`,
        `MQTT_HOST=${this.mqttHost()}`,
        "MQTT_PORT=1883",
        `SERVER_BASE_URL=${this.serverBaseUrl()}`,
        "CAPTURE_WIDTH=1920",
        "CAPTURE_HEIGHT=1080",
      ].join("\n");
    },
  },
  created() {
    this.load();
  },
  methods: {
    blankForm() {
      return {
        code: "",
        type: "pi_camera",
        name: "",
        shelf_id: null,
        mqtt_client_id: "",
        stream_url: "",
        status: "offline",
        metadata: {},
      };
    },
    async load() {
      const [devices, shelves] = await Promise.all([devicesApi.list(), shelvesApi.list()]);
      this.devices = devices.data;
      this.shelves = shelves.data;
    },
    openCreate() {
      this.editing = null;
      this.form = this.blankForm();
      this.metadataText = "{}";
      this.$bvModal.show("device-modal");
    },
    openEdit(device) {
      this.editing = device;
      this.form = {
        code: device.code,
        type: device.type,
        name: device.name,
        shelf_id: device.shelf_id || null,
        mqtt_client_id: device.mqtt_client_id || "",
        stream_url: device.stream_url || "",
        status: device.status || "offline",
        metadata: device.metadata || {},
      };
      this.metadataText = JSON.stringify(device.metadata || {}, null, 2);
      this.$bvModal.show("device-modal");
    },
    async saveDevice() {
      let metadata;
      try {
        metadata = this.metadataText ? JSON.parse(this.metadataText) : {};
      } catch (err) {
        this.$bvToast.toast("Metadata JSON is invalid", { title: "Devices", variant: "danger", solid: true });
        return;
      }

      const payload = {
        ...this.form,
        shelf_id: this.form.shelf_id || null,
        mqtt_client_id: this.form.mqtt_client_id || null,
        stream_url: this.form.stream_url || null,
        metadata,
      };

      if (this.editing) await devicesApi.update(this.editing.id, payload);
      else await devicesApi.create(payload);

      this.$bvModal.hide("device-modal");
      await this.load();
    },
    async retire(device) {
      const ok = await this.$bvModal.msgBoxConfirm(`Retire ${device.code}?`, {
        title: "Retire Device",
        okVariant: "warning",
        okTitle: "Retire",
        cancelTitle: "Cancel",
      });
      if (!ok) return;
      await devicesApi.retire(device.id);
      await this.load();
    },
    showMetadata(device) {
      this.selectedMetadata = device.metadata || {};
      this.$bvModal.show("metadata-modal");
    },
    async issueToken(device) {
      const res = await devicesApi.issueToken(device.id, {});
      this.issuedToken = res.data;
      this.issuedTokenDevice = device;
      this.issuedTokenTitle = "Device Token Created";
      this.$bvModal.show("device-token-modal");
      await this.load();
    },
    async rotateToken(device) {
      const ok = await this.$bvModal.msgBoxConfirm(
        "Token cũ sẽ không còn sử dụng được. Bạn cần cập nhật lại Raspberry Pi .env và restart service.",
        {
          title: "Rotate Device Token",
          okVariant: "warning",
          okTitle: "Rotate",
          cancelTitle: "Cancel",
        }
      );
      if (!ok) return;
      const res = await devicesApi.rotateToken(device.id, {});
      this.issuedToken = res.data;
      this.issuedTokenDevice = device;
      this.issuedTokenTitle = "New Device Token";
      this.$bvModal.show("device-token-modal");
      await this.load();
    },
    async revokeToken(device) {
      const ok = await this.$bvModal.msgBoxConfirm(
        "Thiết bị sẽ không thể upload ảnh/dữ liệu sau khi token bị thu hồi.",
        {
          title: "Revoke Device Token",
          okVariant: "danger",
          okTitle: "Revoke",
          cancelTitle: "Cancel",
        }
      );
      if (!ok) return;
      await devicesApi.revokeToken(device.id);
      await this.load();
    },
    showSetupGuide(device) {
      this.guideDevice = device;
      this.$bvModal.show("setup-guide-modal");
    },
    clearIssuedToken() {
      this.issuedToken = null;
      this.issuedTokenDevice = null;
    },
    async copyToken() {
      const token = this.issuedToken && this.issuedToken.device_token;
      if (!token) return;
      try {
        await navigator.clipboard.writeText(token);
      } catch (err) {
        const textarea = document.createElement("textarea");
        textarea.value = token;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      this.$bvToast.toast("Token copied", { title: "Devices", variant: "success", solid: true });
    },
    downloadEnv() {
      if (!this.issuedToken) return;
      const content = this.envContent(this.issuedToken, this.issuedTokenDevice);
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${this.issuedToken.device_code}.env`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    },
    envContent(tokenResponse, device) {
      return [
        `DEVICE_CODE=${tokenResponse.device_code}`,
        `DEVICE_ID=${tokenResponse.device_id}`,
        `DEVICE_TOKEN=${tokenResponse.device_token}`,
        `SHELF_CODE=${this.shelfCodeValue(device && device.shelf_id)}`,
        `MQTT_HOST=${this.mqttHost()}`,
        "MQTT_PORT=1883",
        `SERVER_BASE_URL=${this.serverBaseUrl()}`,
        "CAPTURE_WIDTH=1920",
        "CAPTURE_HEIGHT=1080",
      ].join("\n");
    },
    shelfCode(shelfId) {
      const shelf = this.shelves.find((item) => item.id === shelfId);
      return shelf ? shelf.code : "-";
    },
    shelfCodeValue(shelfId) {
      const shelf = this.shelves.find((item) => item.id === shelfId);
      return shelf ? shelf.code : "";
    },
    effectiveStatus(device) {
      if (!device) return "offline";
      if (device.status !== "online") return device.status || "offline";
      if (!device.last_seen_at) return "offline";
      const ageSeconds = (Date.now() - new Date(device.last_seen_at).getTime()) / 1000;
      return ageSeconds > OFFLINE_AFTER_SECONDS ? "offline" : "online";
    },
    statusVariant(status) {
      if (status === "online") return "success";
      if (status === "error") return "danger";
      if (status === "maintenance") return "warning";
      return "secondary";
    },
    tokenStatus(device) {
      if (!device.token_preview && !device.token_issued_at) return "No token";
      if (device.token_revoked_at) return "Revoked";
      return "Active";
    },
    tokenVariant(status) {
      if (status === "Active") return "success";
      if (status === "Revoked") return "danger";
      return "secondary";
    },
    mqttHost() {
      return process.env.VUE_APP_MQTT_HOST || window.location.hostname || "localhost";
    },
    serverBaseUrl() {
      if (process.env.VUE_APP_API_BASE_URL) return process.env.VUE_APP_API_BASE_URL;
      return `${window.location.protocol}//${window.location.hostname}:8000`;
    },
    mergeById(base, realtime) {
      const map = new Map();
      [...base, ...realtime].forEach((item) => {
        if (!item || !item.id) return;
        map.set(item.id, { ...(map.get(item.id) || {}), ...item });
      });
      return Array.from(map.values());
    },
  },
};
</script>

<style scoped>
.setup-env-preview {
  background: rgba(0, 0, 0, 0.22);
  border-radius: 6px;
  padding: 12px;
  white-space: pre-wrap;
}
</style>
