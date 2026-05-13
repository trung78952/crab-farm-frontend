import api from './axios'

export default {
  list() { return api.get('/api/v1/detections') },
  byTank(tankId) { return api.get(`/api/v1/detections/by-tank/${tankId}`) },
  mock(payload) { return api.post('/api/v1/detections/mock', payload) }
}
