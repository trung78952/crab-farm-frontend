import api from './axios'

export default {
  home(params = {}) { return api.post('/api/v1/motion/home', null, { params }) },
  unlock(params = {}) { return api.post('/api/v1/motion/unlock', null, { params }) },
  moveToTank(tankId, payload = {}) { return api.post(`/api/v1/motion/move-to-tank/${tankId}`, payload) },
  cameraApproach(tankId) { return api.post(`/api/v1/motion/camera-approach/${tankId}`) },
  cameraRetract(params = {}) { return api.post('/api/v1/motion/camera-retract', null, { params }) },
  gcode(payload) { return api.post('/api/v1/motion/gcode', payload) },
  emergencyStop(params = {}) { return api.post('/api/v1/motion/emergency-stop', null, { params }) },
  status(params = {}) { return api.get('/api/v1/motion/status', { params }) },
  commands() { return api.get('/api/v1/motion/commands') },
  command(cmdId) { return api.get(`/api/v1/motion/commands/${cmdId}`) }
}
