import api from './axios'

export default {
  logs(params = {}) { return api.get('/api/v1/mqtt/logs', { params }) },
  topics() { return api.get('/api/v1/mqtt/topics') },
  publish(payload) { return api.post('/api/v1/mqtt/publish', payload) }
}
