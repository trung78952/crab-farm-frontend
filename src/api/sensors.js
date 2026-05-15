import api from './axios'

export default {
  sensorTypes() { return api.get('/api/v1/sensor-types') },
  createSensorType(payload) { return api.post('/api/v1/sensor-types', payload) },
  updateSensorType(id, payload) { return api.patch(`/api/v1/sensor-types/${id}`, payload) },
  sensors(params = {}) { return api.get('/api/v1/sensors', { params }) },
  createSensor(payload) { return api.post('/api/v1/sensors', payload) },
  updateSensor(id, payload) { return api.patch(`/api/v1/sensors/${id}`, payload) },
  deactivateSensor(id) { return api.delete(`/api/v1/sensors/${id}`) },
  readings(params = {}) { return api.get('/api/v1/sensor-readings', { params }) },
  createReading(payload) { return api.post('/api/v1/sensor-readings', payload) },
  latest(params = {}) { return api.get('/api/v1/sensor-readings/latest', { params }) },
  alertRules() { return api.get('/api/v1/sensor-alert-rules') },
  createAlertRule(payload) { return api.post('/api/v1/sensor-alert-rules', payload) },
  updateAlertRule(id, payload) { return api.patch(`/api/v1/sensor-alert-rules/${id}`, payload) },
  alerts(params = {}) { return api.get('/api/v1/sensor-alerts', { params }) },
  ackAlert(id) { return api.post(`/api/v1/sensor-alerts/${id}/ack`) },
  resolveAlert(id) { return api.post(`/api/v1/sensor-alerts/${id}/resolve`) }
}
