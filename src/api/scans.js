import api from './axios'

export default {
  schedules() { return api.get('/api/v1/scan-schedules') },
  createSchedule(payload) { return api.post('/api/v1/scan-schedules', payload) },
  updateSchedule(id, payload) { return api.patch(`/api/v1/scan-schedules/${id}`, payload) },
  enableSchedule(id) { return api.post(`/api/v1/scan-schedules/${id}/enable`) },
  disableSchedule(id) { return api.post(`/api/v1/scan-schedules/${id}/disable`) },
  deleteSchedule(id) { return api.delete(`/api/v1/scan-schedules/${id}`) },
  runAll() { return api.post('/api/v1/scans/run-all') },
  runTank(tankId) { return api.post(`/api/v1/scans/run-tank/${tankId}`) },
  jobs() { return api.get('/api/v1/scans/jobs') },
  jobsV2() { return api.get('/api/v1/scan-jobs') },
  job(id) { return api.get(`/api/v1/scans/jobs/${id}`) }
}
