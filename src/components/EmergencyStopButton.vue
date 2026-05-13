<template>
  <b-button variant="danger" class="emergency-btn" :disabled="busy || !canOperate" @click="stop">
    <i class="fa-solid fa-circle-exclamation fa-lg"></i> Emergency Stop
  </b-button>
</template>

<script>
import motionApi from '../api/motion'

export default {
  name: 'EmergencyStopButton',
  data() {
    return { busy: false }
  },
  computed: {
    canOperate() {
      return this.$store.getters.canOperate
    }
  },
  methods: {
    async stop() {
      if (!window.confirm('Send emergency stop to motion controller?')) return
      this.busy = true
      try {
        await motionApi.emergencyStop()
        this.$bvToast.toast('Emergency stop sent', { title: 'Motion', variant: 'danger', solid: true })
      } finally {
        this.busy = false
      }
    }
  }
}
</script>

<style scoped>
.emergency-btn {
  font-weight: 700;
  letter-spacing: 0;
  min-width: 150px;
}
</style>
