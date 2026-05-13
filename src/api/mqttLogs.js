import api from './axios'

export default {
  list(limit = 100) { return api.get('/api/v1/mqtt-logs', { params: { limit } }) }
}
