<template>
  <div>
    <div class="panel">
      <div class="panel-header">Camera</div>
      <div class="panel-body">
        <b-input-group prepend="Tank UUID" class="mb-3">
          <b-form-input v-model.trim="tankId" />
          <b-input-group-append>
            <b-button variant="primary" :disabled="!tankId" @click="capture">
              <i class="fas fa-camera mr-1"></i>Capture
            </b-button>
          </b-input-group-append>
        </b-input-group>
        <b-form @submit.prevent="upload">
          <b-form-file v-model="file" placeholder="Choose image" class="mb-2" />
          <b-button
            type="submit"
            variant="outline-info"
            :disabled="!file || !tankId"
          >
            <i class="fas fa-upload mr-1"></i>Upload Image
          </b-button>
        </b-form>
      </div>
    </div>

    <div class="panel">
      <div
        class="panel-header d-flex justify-content-between align-items-center"
      >
        <span>Live Stream</span>
        <b-button
          size="sm"
          variant="outline-light"
          :disabled="!streamUrl"
          @click="openStream"
        >
          <i class="fas fa-arrow-up-right-from-square"></i>
        </b-button>
      </div>
      <div class="panel-body">
        <b-form-row class="align-items-end">
          <b-col md="8">
            <b-form-group label="Camera Device">
              <b-form-select
                v-model="selectedDeviceId"
                :options="cameraDeviceOptions"
              />
            </b-form-group>
          </b-col>
          <b-col md="4" v-if="selectedDevice">
            <h5>
              <b-badge
                :variant="statusVariant(effectiveStatus(selectedDevice))"
              >
                {{ effectiveStatus(selectedDevice) }}
              </b-badge>
            </h5>
            <b-form-group label="">
              <!-- <span class="text-muted ml-2">{{ latestStatus(selectedDevice) }}</span> -->
            </b-form-group>
          </b-col>
        </b-form-row>

        <b-alert v-if="selectedDevice && !streamUrl" show variant="warning">
          Camera stream chưa được cấu hình
        </b-alert>
        <div v-if="streamUrl" class="stream-shell">
          <img
            v-if="streamIsImage"
            :src="streamUrl"
            alt="camera live stream"
            @error="streamError = true"
          />
          <iframe v-else :src="streamUrl" title="camera live stream"></iframe>
        </div>
        <b-alert v-if="streamError" show variant="danger" class="mt-3">
          Stream URL is not reachable from this browser.
        </b-alert>
      </div>
    </div>

    <div class="panel">
      <div
        class="panel-header d-flex justify-content-between align-items-center"
      >
        <span>Images</span>
        <b-button size="sm" variant="outline-light" @click="load">
          <i class="fas fa-rotate"></i>
        </b-button>
      </div>
      <div class="panel-body">
        <b-row>
          <b-col
            v-for="image in images"
            :key="image.id"
            lg="2"
            md="4"
            sm="6"
            class="mb-3"
          >
            <div class="image-tile">
              <button
                type="button"
                class="image-button"
                @click="viewImage(image)"
              >
                <img :src="imageUrl(image.image_url)" alt="tank capture" />
              </button>
              <div class="small mt-2">
                <div>{{ image.tank_code || image.tank_id }}</div>
                <div class="text-muted">
                  {{ image.shelf_code || "-" }} / {{ image.kind }}
                </div>
                <div class="text-muted">
                  {{ formatDateTime(image.captured_at || image.created_at) }}
                </div>
              </div>
              <div class="mt-2 d-flex">
                <b-button
                  size="sm"
                  variant="outline-info"
                  class="mr-2"
                  @click="viewImage(image)"
                >
                  <i class="fas fa-up-right-and-down-left-from-center mr-1"></i
                  >View
                </b-button>
                <b-button
                  size="sm"
                  variant="outline-danger"
                  @click="deleteImage(image)"
                >
                  <i class="fas fa-trash"></i>
                </b-button>
              </div>
            </div>
          </b-col>
        </b-row>
        <div v-if="!images.length" class="text-muted py-3">No images</div>
      </div>
    </div>

    <b-modal id="image-modal" size="xl" title="Camera Image" ok-only>
      <div v-if="selectedImage">
        <img
          class="image-large"
          :src="imageUrl(selectedImage.image_url)"
          alt="tank capture large"
        />
        <dl class="row mt-3 mb-0 image-meta">
          <dt class="col-sm-3">image_id</dt>
          <dd class="col-sm-9">{{ selectedImage.id }}</dd>
          <dt class="col-sm-3">tank</dt>
          <dd class="col-sm-9">
            {{ selectedImage.tank_code || selectedImage.tank_id }}
          </dd>
          <dt class="col-sm-3">device</dt>
          <dd class="col-sm-9">
            {{ selectedImage.device_code || selectedImage.device_id || "-" }}
          </dd>
          <dt class="col-sm-3">path/url</dt>
          <dd class="col-sm-9 text-break">
            {{ selectedImage.image_path }} / {{ selectedImage.image_url }}
          </dd>
          <dt class="col-sm-3">created_at</dt>
          <dd class="col-sm-9">
            {{ formatDateTime(selectedImage.created_at) }}
          </dd>
        </dl>
      </div>
    </b-modal>
  </div>
</template>

<script>
import cameraApi from "../api/camera";
import devicesApi from "../api/devices";
import { formatDateTime } from "../utils/dateTime";

const OFFLINE_AFTER_SECONDS = 60;

export default {
  name: "Camera",
  data() {
    return {
      tankId: "",
      file: null,
      images: [],
      devices: [],
      selectedDeviceId: null,
      selectedImage: null,
      streamError: false,
    };
  },
  computed: {
    allDevices() {
      return this.mergeById(this.devices, this.$store.state.devices);
    },
    cameraDevices() {
      return this.allDevices.filter((device) => device.type === "pi_camera");
    },
    cameraDeviceOptions() {
      return this.cameraDevices.map((device) => ({
        value: device.id,
        text: `${device.code} - ${device.name}`,
      }));
    },
    selectedDevice() {
      return (
        this.cameraDevices.find(
          (device) => device.id === this.selectedDeviceId
        ) || null
      );
    },
    streamUrl() {
      return this.selectedDevice && this.selectedDevice.stream_url
        ? this.selectedDevice.stream_url
        : "";
    },
    streamIsImage() {
      return (
        /\.(mjpg|mjpeg|jpg|jpeg|png|gif)(\?|$)/i.test(this.streamUrl) ||
        /stream/i.test(this.streamUrl)
      );
    },
  },
  watch: {
    "$store.state.events.length"() {
      const event = this.$store.state.events[0];
      if (!event) return;
      if (event.event === "image_deleted") {
        this.images = this.images.filter((image) => image.id !== event.data.id);
      }
    },
    streamUrl() {
      this.streamError = false;
    },
  },
  created() {
    this.load();
  },
  methods: {
    formatDateTime,
    async load() {
      const [images, devices] = await Promise.all([
        cameraApi.images(),
        devicesApi.list(),
      ]);
      this.images = images.data;
      this.devices = devices.data;
      if (!this.selectedDeviceId && this.cameraDevices.length) {
        this.selectedDeviceId = this.cameraDevices[0].id;
      }
    },
    imageUrl(path) {
      if (!path) return "";
      if (path.startsWith("http")) return path;
      const base = process.env.VUE_APP_API_BASE_URL || "";
      if (path.startsWith("/")) return `${base}${path}`;
      return `${base}/${path}`;
    },
    async capture() {
      await cameraApi.capture(this.tankId);
      this.$bvToast.toast("Capture command sent", {
        title: "Camera",
        variant: "info",
        solid: true,
      });
    },
    async upload() {
      const form = new FormData();
      form.append("tank_id", this.tankId);
      form.append("file", this.file);
      await cameraApi.upload(form);
      this.file = null;
      await this.load();
    },
    async viewImage(image) {
      this.selectedImage = (await cameraApi.image(image.id)).data;
      this.$bvModal.show("image-modal");
    },
    async deleteImage(image) {
      const ok = await this.$bvModal.msgBoxConfirm(
        `Delete image ${image.id}?`,
        {
          title: "Delete Image",
          okVariant: "danger",
          okTitle: "Delete",
          cancelTitle: "Cancel",
        }
      );
      if (!ok) return;
      await cameraApi.deleteImage(image.id);
      this.images = this.images.filter((item) => item.id !== image.id);
    },
    openStream() {
      if (this.streamUrl) window.open(this.streamUrl, "_blank", "noopener");
    },
    latestStatus(device) {
      return device && device.metadata && device.metadata.latest_status
        ? device.metadata.latest_status
        : "";
    },
    effectiveStatus(device) {
      if (!device) return "offline";
      if (device.status !== "online") return device.status || "offline";
      if (!device.last_seen_at) return "offline";
      const ageSeconds =
        (Date.now() - new Date(device.last_seen_at).getTime()) / 1000;
      return ageSeconds > OFFLINE_AFTER_SECONDS ? "offline" : "online";
    },
    statusVariant(status) {
      if (status === "online") return "success";
      if (status === "error") return "danger";
      if (status === "maintenance") return "warning";
      return "secondary";
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
.stream-shell {
  background: #101219;
  border: 1px solid #3a3d46;
  border-radius: 6px;
  min-height: 280px;
  overflow: hidden;
}

.stream-shell img,
.stream-shell iframe {
  border: 0;
  display: block;
  height: 420px;
  object-fit: contain;
  width: 100%;
}

.image-tile {
  background: #181a22;
  border: 1px solid #3a3d46;
  border-radius: 6px;
  padding: 8px;
}

.image-button {
  background: transparent;
  border: 0;
  display: block;
  padding: 0;
  width: 100%;
}

.image-tile img {
  aspect-ratio: 4 / 3;
  object-fit: cover;
  width: 100%;
}

.image-large {
  background: #101219;
  max-height: 70vh;
  object-fit: contain;
  width: 100%;
}

.image-meta dt {
  color: #9aa0ad;
}
</style>
