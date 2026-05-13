import api from './axios'

export default {
  list() { return api.get('/api/v1/tanks') },
  create(payload) { return api.post('/api/v1/tanks', payload) },
  update(id, payload) { return api.patch(`/api/v1/tanks/${id}`, payload) },
  remove(id) { return api.delete(`/api/v1/tanks/${id}`) }
}
