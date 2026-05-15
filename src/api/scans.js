import api from './axios'

export default {
  schedules(params = {}) { return api.get('/api/v1/scan-schedules', { params }) },
  createSchedule(payload) { return api.post('/api/v1/scan-schedules', payload) },
  updateSchedule(id, payload) { return api.patch(`/api/v1/scan-schedules/${id}`, payload) },
  enableSchedule(id) { return api.post(`/api/v1/scan-schedules/${id}/enable`) },
  disableSchedule(id) { return api.post(`/api/v1/scan-schedules/${id}/disable`) },
  cancelSchedule(id) { return api.post(`/api/v1/scan-schedules/${id}/cancel`) },
  deleteSchedule(id) { return api.delete(`/api/v1/scan-schedules/${id}`) },
  runAll(params = {}) { return api.post('/api/v1/scans/run-all', null, { params }) },
  runTank(tankId) { return api.post(`/api/v1/scans/run-tank/${tankId}`) },
  jobs() { return api.get('/api/v1/scans/jobs') },
  jobsV2() { return api.get('/api/v1/scan-jobs') },
  job(id) { return api.get(`/api/v1/scans/jobs/${id}`) }
}
