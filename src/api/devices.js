import api from './axios'

export default {
  list(params = {}) { return api.get('/api/v1/devices', { params }) },
  get(id) { return api.get(`/api/v1/devices/${id}`) },
  create(payload) { return api.post('/api/v1/devices', payload) },
  update(id, payload) { return api.patch(`/api/v1/devices/${id}`, payload) },
  retire(id) { return api.post(`/api/v1/devices/${id}/retire`) },
  updateStatus(id, payload) { return api.patch(`/api/v1/devices/${id}/status`, payload) },
  issueToken(id, payload = {}) { return api.post(`/api/v1/devices/${id}/issue-token`, payload) },
  rotateToken(id, payload = {}) { return api.post(`/api/v1/devices/${id}/rotate-token`, payload) },
  revokeToken(id) { return api.post(`/api/v1/devices/${id}/revoke-token`) },
  tokenStatus(id) { return api.get(`/api/v1/devices/${id}/token-status`) }
}
