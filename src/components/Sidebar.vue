<template>
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-mark">CF</div>
      <div>
        <div class="brand-title">Crab Farm AI</div>
        <div class="brand-subtitle">Control Console</div>
      </div>
    </div>
    <nav>
      <router-link v-for="item in items" :key="item.to" :to="item.to" exact-active-class="active">
        <span class="nav-icon">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<script>
export default {
  name: 'Sidebar',
  data() {
    return {
      items: [
        { to: '/', label: 'Dashboard', icon: 'D' },
        { to: '/tanks', label: 'Tanks', icon: 'T' },
        { to: '/scan-schedules', label: 'Scan Schedules', icon: 'S' },
        { to: '/scan-jobs', label: 'Scan Jobs', icon: 'J' },
        { to: '/devices', label: 'Devices', icon: 'I' },
        { to: '/motion', label: 'Motion', icon: 'M' },
        { to: '/camera', label: 'Camera', icon: 'C' },
        { to: '/detections', label: 'Detections', icon: 'V' },
        { to: '/harvest', label: 'Harvest', icon: 'H' },
        { to: '/mqtt-logs', label: 'MQTT Logs', icon: 'L' },
        { to: '/settings', label: 'Settings', icon: 'G' }
      ]
    }
  }
}
</script>

<style scoped>
.sidebar {
  background: #11131a;
  border-right: 1px solid #3a3d46;
  bottom: 0;
  left: 0;
  overflow-y: auto;
  position: fixed;
  top: 0;
  width: 240px;
  z-index: 100;
}

.brand {
  align-items: center;
  border-bottom: 1px solid #3a3d46;
  display: flex;
  gap: 10px;
  padding: 16px;
}

.brand-mark {
  align-items: center;
  background: #2dbab4;
  border-radius: 6px;
  color: #081014;
  display: flex;
  font-weight: 800;
  height: 38px;
  justify-content: center;
  width: 38px;
}

.brand-title {
  font-weight: 700;
}

.brand-subtitle {
  color: #9aa0ad;
  font-size: 12px;
}

nav {
  padding: 10px;
}

a {
  align-items: center;
  border-radius: 6px;
  color: #bfc4d2;
  display: flex;
  gap: 10px;
  margin-bottom: 4px;
  padding: 9px 10px;
  text-decoration: none;
}

a:hover,
a.active {
  background: #24262f;
  color: #44d7cf;
  text-decoration: none;
}

.nav-icon {
  align-items: center;
  background: #1b1e27;
  border: 1px solid #3a3d46;
  border-radius: 4px;
  display: inline-flex;
  font-size: 11px;
  height: 22px;
  justify-content: center;
  width: 22px;
}

@media (max-width: 992px) {
  .sidebar {
    display: none;
  }
}
</style>
