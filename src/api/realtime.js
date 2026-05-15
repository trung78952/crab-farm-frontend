const tokenKey = 'crab_farm_access_token'

class RealtimeClient {
  constructor() {
    this.socket = null
    this.retryTimer = null
    this.listeners = []
    this.statusListeners = []
    this.manualClose = false
  }

  connect() {
    const token = localStorage.getItem(tokenKey)
    if (!token || this.socket) return
    this.manualClose = false
    const base = process.env.VUE_APP_API_BASE_URL || window.location.origin
    const wsBase = base.replace(/^http/, 'ws')
    this.socket = new WebSocket(`${wsBase}/ws?token=${encodeURIComponent(token)}`)
    this.socket.onopen = () => {
      this.statusListeners.forEach(listener => listener(true))
    }
    this.socket.onmessage = event => {
      const payload = JSON.parse(event.data)
      this.listeners.forEach(listener => listener(payload))
    }
    this.socket.onclose = () => {
      this.socket = null
      this.statusListeners.forEach(listener => listener(false))
      if (!this.manualClose) {
        clearTimeout(this.retryTimer)
        this.retryTimer = setTimeout(() => this.connect(), 2000)
      }
    }
    this.socket.onerror = () => {
      if (this.socket) this.socket.close()
    }
  }

  disconnect() {
    this.manualClose = true
    clearTimeout(this.retryTimer)
    if (this.socket) this.socket.close()
    this.socket = null
    this.statusListeners.forEach(listener => listener(false))
  }

  onEvent(listener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(item => item !== listener)
    }
  }

  onStatus(listener) {
    this.statusListeners.push(listener)
    return () => {
      this.statusListeners = this.statusListeners.filter(item => item !== listener)
    }
  }
}

export default new RealtimeClient()
