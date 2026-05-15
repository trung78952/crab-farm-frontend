<template>
  <div class="login-page">
    <div class="login-panel">
      <div class="mb-4">
        <div class="login-title">Crab Farm AI</div>
        <div class="text-muted">Smart soft-shell crab farm console</div>
      </div>
      <b-alert :show="Boolean(error)" variant="danger">{{ error }}</b-alert>
      <b-form @submit.prevent="submit">
        <b-form-group label="Username">
          <b-form-input v-model="form.username" autocomplete="username" required />
        </b-form-group>
        <b-form-group label="Password">
          <b-form-input v-model="form.password" type="password" autocomplete="current-password" required />
        </b-form-group>
        <b-button type="submit" variant="primary" block :disabled="busy">
          {{ busy ? "Signing in..." : "Login" }}
        </b-button>
      </b-form>
    </div>
  </div>
</template>

<script>
import {create} from "axios";

export default {
  name: "Login",
  data() {
    return {
      busy: false,
      error: "",
      form: {username: "admin", password: "admin123"},
    };
  },
  methods: {
    async submit() {
      this.busy = true;
      this.error = "";
      try {
        await this.$store.dispatch("login", this.form);
        this.$router.push(this.$route.query.redirect || "/");
      } catch (err) {
        this.error = err.response && err.response.data ? err.response.data.detail : "Login failed";
      } finally {
        this.busy = false;
      }
    },
  },
};
</script>

<style scoped>
.login-page {
  align-items: center;
  background: radial-gradient(circle at top, #26313a, #181a22 42%, #101219);
  display: flex;
  min-height: 100vh;
  justify-content: center;
  padding: 24px;
}

.login-panel {
  background: #24262f;
  border: 1px solid #3a3d46;
  border-radius: 8px;
  box-shadow: 0 20px 80px rgba(0, 0, 0, 0.35);
  max-width: 420px;
  padding: 28px;
  width: 100%;
}

.login-title {
  color: #44d7cf;
  font-size: 26px;
  font-weight: 800;
}
</style>
