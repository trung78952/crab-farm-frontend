import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Tanks from '../views/Tanks.vue'
import ScanSchedules from '../views/ScanSchedules.vue'
import ScanJobs from '../views/ScanJobs.vue'
import Devices from '../views/Devices.vue'
import Motion from '../views/Motion.vue'
import Camera from '../views/Camera.vue'
import Detections from '../views/Detections.vue'
import Harvest from '../views/Harvest.vue'
import MqttLogs from '../views/MqttLogs.vue'
import Settings from '../views/Settings.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/login', name: 'login', component: Login, meta: { public: true } },
  {
    path: '/',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'dashboard', component: Dashboard },
      { path: 'tanks', name: 'tanks', component: Tanks },
      { path: 'scan-schedules', name: 'scan-schedules', component: ScanSchedules },
      { path: 'scan-jobs', name: 'scan-jobs', component: ScanJobs },
      { path: 'devices', name: 'devices', component: Devices },
      { path: 'motion', name: 'motion', component: Motion },
      { path: 'camera', name: 'camera', component: Camera },
      { path: 'detections', name: 'detections', component: Detections },
      { path: 'harvest', name: 'harvest', component: Harvest },
      { path: 'mqtt-logs', name: 'mqtt-logs', component: MqttLogs },
      { path: 'settings', name: 'settings', component: Settings }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.public) {
    next()
    return
  }
  if (!store.getters.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }
  next()
})

export default router
