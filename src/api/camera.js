import api from './axios'

export default {
  capture(tankId) { return api.post(`/api/v1/camera/capture/${tankId}`) },
  images(params = {}) { return api.get('/api/v1/camera/images', { params }) },
  image(id) { return api.get(`/api/v1/camera/images/${id}`) },
  deleteImage(id, params = {}) { return api.delete(`/api/v1/camera/images/${id}`, { params }) },
  upload(formData) { return api.post('/api/v1/camera/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }) }
}
