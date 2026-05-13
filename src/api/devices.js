import api from './axios'

export default {
  list() { return api.get('/api/v1/devices') },
  create(payload) { return api.post('/api/v1/devices', payload) },
  updateStatus(id, payload) { return api.patch(`/api/v1/devices/${id}/status`, payload) }
}
