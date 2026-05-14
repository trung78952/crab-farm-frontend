import api from './axios'

export default {
  list() { return api.get('/api/v1/recheck-tasks') },
  cancel(id) { return api.post(`/api/v1/recheck-tasks/${id}/cancel`) },
  runDueNow() { return api.post('/api/v1/recheck-tasks/run-due-now') }
}
