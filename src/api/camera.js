import api from './axios'

export default {
  capture(tankId) { return api.post(`/api/v1/camera/capture/${tankId}`) },
  images(params = {}) { return api.get('/api/v1/camera/images', { params }) },
  upload(formData) { return api.post('/api/v1/camera/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }) }
}
