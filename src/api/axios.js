import axios from 'axios'

const tokenKey = 'crab_farm_access_token'
const userKey = 'crab_farm_user'

const api = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || '',
  timeout: 15000
})

function commitLoading(mutation) {
  try {
    const store = require('../store').default
    store.commit(mutation)
  } catch (err) {
    // Store can be unavailable during initial module loading.
  }
}

api.interceptors.request.use(config => {
  const token = localStorage.getItem(tokenKey)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (!config.skipGlobalLoading) commitLoading('incrementLoading')
  return config
})

api.interceptors.response.use(
  response => {
    if (!response.config.skipGlobalLoading) commitLoading('decrementLoading')
    return response
  },
  error => {
    if (error.config && !error.config.skipGlobalLoading) commitLoading('decrementLoading')
    if (error.response && error.response.status === 401) {
      localStorage.removeItem(tokenKey)
      localStorage.removeItem(userKey)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
