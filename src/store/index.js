import Vue from 'vue'
import Vuex from 'vuex'
import authApi from '../api/auth'
import realtime from '../api/realtime'

Vue.use(Vuex)

const tokenKey = 'crab_farm_access_token'
const userKey = 'crab_farm_user'
const darkKey = 'crab_farm_dark_mode'

export default new Vuex.Store({
  state: {
    token: localStorage.getItem(tokenKey),
    user: JSON.parse(localStorage.getItem(userKey) || 'null'),
    darkMode: localStorage.getItem(darkKey) !== 'false',
    realtimeConnected: false,
    events: [],
    mqttLogs: [],
    scanJobs: [],
    detections: [],
    simulationMode: false
  },
  getters: {
    isAuthenticated: state => Boolean(state.token),
    currentUser: state => state.user,
    canOperate: state => state.user && ['admin', 'operator'].includes(state.user.role)
  },
  mutations: {
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
    pushRealtimeEvent(state, event) {
      state.events.unshift(event)
      state.events = state.events.slice(0, 100)
      if (event.event === 'mqtt_log_created') state.mqttLogs.unshift(event.data)
      if (event.event === 'scan_job_created' || event.event === 'scan_job_updated') state.scanJobs.unshift(event.data)
      if (event.event === 'detection_created') state.detections.unshift(event.data)
    },
    setSimulationMode(state, enabled) {
      state.simulationMode = enabled
    }
  },
  actions: {
    bootstrap({ state, commit }) {
      document.body.classList.toggle('light-mode', !state.darkMode)
      if (state.token) {
        authApi.me().then(res => commit('setUser', res.data)).catch(() => commit('clearAuth'))
        realtime.connect()
      }
    },
    async login({ commit }, credentials) {
      const res = await authApi.login(credentials)
      commit('setAuth', res.data)
      realtime.connect()
      return res.data
    },
    logout({ commit }) {
      commit('clearAuth')
      realtime.disconnect()
    },
    toggleDarkMode({ state, commit }) {
      commit('setDarkMode', !state.darkMode)
    },
    startRealtime({ commit }) {
      realtime.onEvent(event => {
        commit('setRealtimeConnected', true)
        commit('pushRealtimeEvent', event)
      })
      realtime.connect()
    }
  }
})
