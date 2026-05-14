import api from './axios'

export default {
  list() { return api.get('/api/v1/shelves') },
  create(payload) { return api.post('/api/v1/shelves', payload) },
  update(id, payload) { return api.patch(`/api/v1/shelves/${id}`, payload) },
  maintenance(id) { return api.post(`/api/v1/shelves/${id}/maintenance`) },
  activate(id) { return api.post(`/api/v1/shelves/${id}/activate`) }
}
