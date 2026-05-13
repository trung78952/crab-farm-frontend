<template>
  <div class="panel">
    <div class="panel-header">Settings</div>
    <div class="panel-body">
      <b-row>
        <b-col md="6">
          <b-form-group label="API base URL">
            <b-form-input :value="apiBase" readonly />
          </b-form-group>
          <b-form-checkbox :checked="$store.state.darkMode" switch @change="$store.commit('setDarkMode', $event)">
            Dark mode
          </b-form-checkbox>
        </b-col>
        <b-col md="6">
          <div class="console-panel">Frontend: Vue 2.6.12
Auth: JWT Bearer
Theme: Fluidd-inspired dark console</div>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Settings',
  computed: {
    apiBase() {
      return process.env.VUE_APP_API_BASE_URL || 'http://localhost:8000'
    }
  }
}
</script>
