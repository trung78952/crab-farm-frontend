<template>
  <div class="app-shell bg-app">
    <Sidebar />
    <main class="main-panel">
      <Topbar />
      <section class="page-content">
        <router-view />
      </section>
    </main>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue'
import Topbar from '../components/Topbar.vue'

export default {
  name: 'DashboardLayout',
  components: { Sidebar, Topbar }
}
</script>
