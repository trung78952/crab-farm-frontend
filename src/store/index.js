import Vue from 'vue'
import Vuex from 'vuex'
import authApi from '../api/auth'
import realtime from '../api/realtime'

Vue.use(Vuex)

const tokenKey = 'crab_farm_access_token'
const userKey = 'crab_farm_user'
const darkKey = 'crab_farm_dark_mode'

function upsertById(list, item, prepend = true) {
  if (!item || !item.id) return
  const index = list.findIndex(existing => existing.id === item.id)
  if (index === -1) {
    if (prepend) list.unshift(item)
    else list.push(item)
    return
  }
  Vue.set(list, index, { ...list[index], ...item })
}

export default new Vuex.Store({
  state: {
    token: localStorage.getItem(tokenKey),
    user: JSON.parse(localStorage.getItem(userKey) || 'null'),
    darkMode: localStorage.getItem(darkKey) !== 'false',
    loadingCount: 0,
    realtimeConnected: false,
    realtimeStarted: false,
    events: [],
    mqttLogs: [],
    scanJobs: [],
    scanSchedules: [],
    detections: [],
    shelves: [],
    tanks: [],
    sensorReadings: [],
    sensorAlerts: [],
    motionCommands: [],
    harvests: [],
    simulationMode: false
  },
  getters: {
    isAuthenticated: state => Boolean(state.token),
    currentUser: state => state.user,
    canOperate: state => state.user && ['admin', 'operator'].includes(state.user.role),
    isLoading: state => state.loadingCount > 0
  },
  mutations: {
    incrementLoading(state) {
      state.loadingCount += 1
    },
    decrementLoading(state) {
      state.loadingCount = Math.max(0, state.loadingCount - 1)
    },
    setAuth(state, payload) {
      state.token = payload.access_token
      state.user = payload.user
      localStorage.setItem(tokenKey, payload.access_token)
      localStorage.setItem(userKey, JSON.stringify(payload.user))
    },
    clearAuth(state) {
      state.token = null
      state.user = null
      localStorage.removeItem(tokenKey)
      localStorage.removeItem(userKey)
    },
    setUser(state, user) {
      state.user = user
      localStorage.setItem(userKey, JSON.stringify(user))
    },
    setDarkMode(state, enabled) {
      state.darkMode = enabled
      localStorage.setItem(darkKey, String(enabled))
      document.body.classList.toggle('light-mode', !enabled)
    },
    setRealtimeConnected(state, connected) {
      state.realtimeConnected = connected
    },
    setRealtimeStarted(state, started) {
      state.realtimeStarted = started
    },
    pushRealtimeEvent(state, event) {
      state.events.unshift(event)
      state.events = state.events.slice(0, 100)
      const data = event.data || {}
      if (event.event === 'mqtt_log_created') {
        upsertById(state.mqttLogs, data)
        state.mqttLogs = state.mqttLogs.slice(0, 300)
      }
      if (event.event === 'scan_job_created' || event.event === 'scan_job_updated') upsertById(state.scanJobs, data)
      if (event.event === 'scan_job_item_updated') {
        const job = state.scanJobs.find(item => item.id === data.scan_job_id)
        if (job) {
          job.items = job.items || []
          upsertById(job.items, data, false)
        }
      }
      if (event.event === 'scan_schedule_created' || event.event === 'scan_schedule_updated') upsertById(state.scanSchedules, data)
      if (event.event === 'detection_created') upsertById(state.detections, data)
      if (event.event === 'shelf_created' || event.event === 'shelf_updated') upsertById(state.shelves, data, false)
      if (event.event === 'tank_created' || event.event === 'tank_updated') upsertById(state.tanks, data, false)
      if (event.event === 'sensor_reading_created') {
        upsertById(state.sensorReadings, data)
        state.sensorReadings = state.sensorReadings.slice(0, 300)
      }
      if (event.event === 'sensor_alert_created') upsertById(state.sensorAlerts, data)
      if (event.event === 'motion_command_created' || event.event === 'motion_command_updated') upsertById(state.motionCommands, data)
      if (event.event === 'harvest_updated') upsertById(state.harvests, data)
    },
    setSimulationMode(state, enabled) {
      state.simulationMode = enabled
    }
  },
  actions: {
    bootstrap({ state, commit, dispatch }) {
      document.body.classList.toggle('light-mode', !state.darkMode)
      if (state.token) {
        authApi.me().then(res => commit('setUser', res.data)).catch(() => commit('clearAuth'))
        dispatch('startRealtime')
      }
    },
    async login({ commit, dispatch }, credentials) {
      const res = await authApi.login(credentials)
      commit('setAuth', res.data)
      dispatch('startRealtime')
      return res.data
    },
    logout({ commit }) {
      commit('clearAuth')
      commit('setRealtimeConnected', false)
      realtime.disconnect()
    },
    toggleDarkMode({ state, commit }) {
      commit('setDarkMode', !state.darkMode)
    },
    startRealtime({ state, commit }) {
      if (!state.token) return
      if (!state.realtimeStarted) {
        realtime.onStatus(connected => {
          commit('setRealtimeConnected', connected)
        })
        realtime.onEvent(event => {
          commit('setRealtimeConnected', true)
          commit('pushRealtimeEvent', event)
        })
        commit('setRealtimeStarted', true)
      }
      realtime.connect()
    }
  }
})
