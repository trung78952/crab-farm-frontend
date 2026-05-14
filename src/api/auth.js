import api from './axios'

export default {
  login(payload) {
    return api.post('/api/v1/auth/login', payload)
  },
  me() {
    return api.get('/api/v1/auth/me')
  },
  logout() {
    return api.post('/api/v1/auth/logout')
  },
  changePassword(payload) {
    return api.post('/api/v1/auth/change-password', payload)
  }
}
