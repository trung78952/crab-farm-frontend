import api from './axios'

export default {
  list() { return api.get('/api/v1/harvest') },
  queue(tankId, note = null) { return api.post(`/api/v1/harvest/queue/${tankId}`, { note }) },
  start(id) { return api.post(`/api/v1/harvest/start/${id}`) }
}
