import api from './axios'

export default {
  status() { return api.get('/api/v1/ai/status') },
  detect(imageId) { return api.post(`/api/v1/ai/detect/${imageId}`) },
  models() { return api.get('/api/v1/ai/models') },
  activate(payload) { return api.post('/api/v1/ai/models/activate', payload) }
}
