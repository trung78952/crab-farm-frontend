<template>
  <div>
    <div class="panel">
      <div class="panel-header">Camera</div>
      <div class="panel-body">
        <b-input-group prepend="Tank UUID" class="mb-3">
          <b-form-input v-model="tankId" />
          <b-input-group-append><b-button variant="primary" @click="capture">Capture</b-button></b-input-group-append>
        </b-input-group>
        <b-form @submit.prevent="upload">
          <b-form-file v-model="file" placeholder="Choose image" class="mb-2" />
          <b-button type="submit" variant="outline-info" :disabled="!file || !tankId">Upload Image</b-button>
        </b-form>
      </div>
    </div>
    <div class="panel">
      <div class="panel-header">Images</div>
      <div class="panel-body">
        <b-row>
          <b-col v-for="image in images" :key="image.id" md="3" sm="6" class="mb-3">
            <div class="image-tile">
              <img :src="imageUrl(image.image_url)" alt="tank capture">
              <div class="small mt-2 text-muted">{{ image.kind }} / {{ image.created_at }}</div>
            </div>
          </b-col>
        </b-row>
      </div>
    </div>
  </div>
</template>

<script>
import cameraApi from '../api/camera'

export default {
  name: 'Camera',
  data() {
    return { tankId: '', file: null, images: [] }
  },
  created() { this.load() },
  methods: {
    imageUrl(path) {
      if (!path) return ''
      if (path.startsWith('http')) return path
      return `${process.env.VUE_APP_API_BASE_URL || 'http://localhost:8000'}${path}`
    },
    async load() { this.images = (await cameraApi.images()).data },
    async capture() {
      await cameraApi.capture(this.tankId)
      this.$bvToast.toast('Capture command sent', { title: 'Camera', variant: 'info', solid: true })
    },
    async upload() {
      const form = new FormData()
      form.append('tank_id', this.tankId)
      form.append('file', this.file)
      await cameraApi.upload(form)
      this.file = null
      await this.load()
    }
  }
}
</script>

<style scoped>
.image-tile {
  background: #181a22;
  border: 1px solid #3a3d46;
  border-radius: 6px;
  padding: 8px;
}

.image-tile img {
  aspect-ratio: 4 / 3;
  object-fit: cover;
  width: 100%;
}
</style>
