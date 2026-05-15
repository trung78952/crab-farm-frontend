<template>
  <div class="panel">
    <div class="panel-header">Settings</div>
    <div class="panel-body">
      <b-row>
        <b-col md="6">
          <b-form-group label="API base URL">
            <b-form-input :value="apiBase" readonly />
          </b-form-group>
          <b-form-checkbox :checked="$store.state.darkMode" switch @change="$store.commit('setDarkMode', $event)"> Dark mode </b-form-checkbox>
          <hr />
          <h6>Change Password</h6>
          <b-form-group label="Current password"><b-form-input v-model="password.current_password" type="password" /></b-form-group>
          <b-form-group label="New password"><b-form-input v-model="password.new_password" type="password" /></b-form-group>
          <b-form-group label="Confirm password"><b-form-input v-model="confirmPassword" type="password" /></b-form-group>
          <b-button variant="primary" :disabled="passwordBusy" @click="changePassword"> <b-spinner v-if="passwordBusy" small /> Change Password </b-button>
        </b-col>
        <b-col md="6">
          <div class="console-panel">Frontend: Vue 2.6.12 Auth: JWT Bearer Theme: Fluidd-inspired dark console Simulation: {{ aiStatus.simulation_mode }} AI enabled: {{ aiStatus.enabled }} AI mock: {{ aiStatus.mock_mode }} Model: {{ aiStatus.active_model_version }}</div>
          <hr />
          <h6>Activate AI Model</h6>
          <b-form-group label="Model path"><b-form-input v-model="modelForm.model_path" /></b-form-group>
          <b-form-group label="Model version"><b-form-input v-model="modelForm.model_version" /></b-form-group>
          <b-button variant="outline-info" @click="activateModel">Activate Model</b-button>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import authApi from "../api/auth";
import aiApi from "../api/ai";

export default {
  name: "Settings",
  data() {
    return {
      password: {current_password: "", new_password: ""},
      passwordBusy: false,
      confirmPassword: "",
      aiStatus: {},
      modelForm: {model_path: "storage/models/crab_yolov8_v1.pt", model_version: "crab_yolov8_v1"},
    };
  },
  computed: {
    apiBase() {
      return process.env.VUE_APP_API_BASE_URL || "http://localhost:8000";
    },
  },
  created() {
    this.loadAiStatus();
  },
  methods: {
    async loadAiStatus() {
      this.aiStatus = (await aiApi.status()).data;
    },
    async changePassword() {
      if (this.password.new_password !== this.confirmPassword) {
        this.$bvToast.toast("Confirm password does not match", {title: "Settings", variant: "danger", solid: true});
        return;
      }
      this.passwordBusy = true;
      try {
        await authApi.changePassword(this.password);
        this.password = {current_password: "", new_password: ""};
        this.confirmPassword = "";
        this.$bvToast.toast("Password changed", {title: "Settings", variant: "success", solid: true});
      } finally {
        this.passwordBusy = false;
      }
    },
    async activateModel() {
      await aiApi.activate(this.modelForm);
      await this.loadAiStatus();
      this.$bvToast.toast("AI model activated", {title: "AI", variant: "success", solid: true});
    },
  },
};
</script>
