import api from './axios'

export default {
  home() { return api.post('/api/v1/motion/home') },
  moveToTank(tankId, payload = {}) { return api.post(`/api/v1/motion/move-to-tank/${tankId}`, payload) },
  gcode(lines) { return api.post('/api/v1/motion/gcode', { lines }) },
  emergencyStop() { return api.post('/api/v1/motion/emergency-stop') },
  commands() { return api.get('/api/v1/motion/commands') },
  command(cmdId) { return api.get(`/api/v1/motion/commands/${cmdId}`) }
}
