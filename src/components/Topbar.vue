<template>
  <header class="topbar">
    <div>
      <div class="app-title">Crab Farm AI</div>
      <div class="status-line">
        <span :class="['status-dot', serverOk ? 'ok' : 'danger']" />
        Server {{ serverOk ? "online" : "offline" }}
        <span class="mx-2">/</span>
        MQTT {{ mqttConnected ? "connected" : "unknown" }}
      </div>
    </div>
    <div class="top-actions">
      <EmergencyStopButton />
      <!-- <b-button size="sm" variant="outline-light" @click="$store.dispatch('toggleDarkMode')">
        {{ darkMode ? 'Dark' : 'Light' }}
      </b-button> -->
      <!-- <span class="user-pill">{{ userLabel }}</span> -->
      <b-dropdown variant="outline-light">
        <template #button-content>
          <span >
            <i class="fa-solid fa-user"></i>
          </span>
          {{ userLabel }}
        </template>
        <b-dropdown-item @click="logout"
          ><i class="fa-solid fa-arrow-left-from-bracket"></i>
          Logout</b-dropdown-item
        >
      </b-dropdown>
      <!-- <b-button size="sm" variant="outline-light" @click="logout">
        Logout
      </b-button> -->
    </div>
  </header>
</template>

<script>
import api from "../api/axios";
import EmergencyStopButton from "./EmergencyStopButton.vue";

export default {
  name: "Topbar",
  components: { EmergencyStopButton },
  data() {
    return {
      serverOk: false,
      mqttConnected: false,
    };
  },
  computed: {
    darkMode() {
      return this.$store.state.darkMode;
    },
    userLabel() {
      const user = this.$store.getters.currentUser;
      return user ? `${user.username} / ${user.role}` : "anonymous";
    },
  },
  created() {
    this.loadHealth();
  },
  methods: {
    async loadHealth() {
      try {
        const res = await api.get("/health");
        this.serverOk = res.data.status === "ok";
        this.mqttConnected = Boolean(res.data.mqtt_connected);
      } catch (err) {
        this.serverOk = false;
      }
    },
    logout() {
      this.$store.dispatch("logout");
      this.$router.push({ name: "login" });
    },
  },
};
</script>

<style scoped>
.topbar {
  align-items: center;
  background: #20222b;
  border-bottom: 1px solid #3a3d46;
  display: flex;
  justify-content: space-between;
  min-height: 64px;
  padding: 10px 18px;
}

.app-title {
  font-size: 18px;
  font-weight: 700;
}

.status-line {
  color: #9aa0ad;
  font-size: 12px;
}

.top-actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.user-pill {
  background: #181a22;
  border: 1px solid #3a3d46;
  border-radius: 999px;
  color: #d7dae3;
  padding: 5px 10px;
}
</style>
