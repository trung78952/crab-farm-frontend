import api from './axios'

export default {
  list(params = {}) { return api.get('/api/v1/training-samples', { params }) },
  fromDetection(id) { return api.post(`/api/v1/training-samples/from-detection/${id}`) },
  label(id, payload) { return api.patch(`/api/v1/training-samples/${id}/label`, payload) },
  exportYolo() { return api.post('/api/v1/datasets/export-yolo') }
}
