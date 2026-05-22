const tokenKey = 'crab_farm_access_token'
const CONNECT_TIMEOUT_MS = 5000
const RETRY_DELAY_MS = 2000

function toWsUrl(base, token) {
  const normalizedBase = base.replace(/\/$/, '').replace(/^http/i, 'ws')
  return `${normalizedBase}/api/ws?token=${encodeURIComponent(token)}`
}

function toLegacyWsUrl(base, token) {
  const normalizedBase = base.replace(/\/$/, '').replace(/^http/i, 'ws')
  return `${normalizedBase}/ws?token=${encodeURIComponent(token)}`
}

function unique(values) {
  return values.filter((value, index) => value && values.indexOf(value) === index)
}

function localBackendBase() {
  if (!['localhost', '127.0.0.1'].includes(window.location.hostname)) return null
  return `${window.location.protocol}//${window.location.hostname}:8000`
}

class RealtimeClient {
  constructor() {
    this.socket = null
    this.retryTimer = null
    this.connectTimer = null
    this.listeners = []
    this.statusListeners = []
    this.manualClose = false
    this.activeToken = null
    this.activeUrl = null
  }

  connect() {
    const token = localStorage.getItem(tokenKey)
    if (!token) return

    if (
      this.socket &&
      this.activeToken === token &&
      (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)
    ) {
      return
    }

    this.closeSocketOnly()
    this.manualClose = false
    this.activeToken = token
    this.connectToCandidate(this.buildUrls(token), 0)
  }

  buildUrls(token) {
    return unique([
      localBackendBase() ? toWsUrl(localBackendBase(), token) : null,
      toWsUrl(window.location.origin, token),
      process.env.VUE_APP_API_BASE_URL ? toWsUrl(process.env.VUE_APP_API_BASE_URL, token) : null,
      process.env.VUE_APP_API_BASE_URL ? toLegacyWsUrl(process.env.VUE_APP_API_BASE_URL, token) : null
    ])
  }

  connectToCandidate(urls, index) {
    if (this.manualClose || index >= urls.length) return

    let socket
    try {
      socket = new WebSocket(urls[index])
    } catch (err) {
      this.connectToCandidate(urls, index + 1)
      return
    }
    this.socket = socket
    this.activeUrl = urls[index]
    let opened = false

    this.connectTimer = setTimeout(() => {
      if (this.socket === socket && socket.readyState === WebSocket.CONNECTING) {
        socket.close()
      }
    }, CONNECT_TIMEOUT_MS)

    socket.onopen = () => {
      opened = true
      clearTimeout(this.connectTimer)
      this.statusListeners.forEach(listener => listener(true))
    }

    socket.onmessage = event => {
      try {
        const payload = JSON.parse(event.data)
        this.listeners.forEach(listener => listener(payload))
      } catch (err) {
        // Ignore malformed realtime frames without breaking the socket.
      }
    }

    socket.onclose = () => {
      clearTimeout(this.connectTimer)
      if (this.socket !== socket) return
      this.socket = null
      this.statusListeners.forEach(listener => listener(false))
      if (this.manualClose) return

      if (!opened && index + 1 < urls.length) {
        this.connectToCandidate(urls, index + 1)
        return
      }

      clearTimeout(this.retryTimer)
      this.retryTimer = setTimeout(() => this.connect(), RETRY_DELAY_MS)
    }

    socket.onerror = () => {
      socket.close()
    }
  }

  disconnect() {
    this.manualClose = true
    clearTimeout(this.retryTimer)
    this.closeSocketOnly()
    this.activeToken = null
    this.activeUrl = null
    this.statusListeners.forEach(listener => listener(false))
  }

  closeSocketOnly() {
    clearTimeout(this.connectTimer)
    if (this.socket) {
      const socket = this.socket
      this.socket = null
      socket.close()
    }
  }

  getState() {
    return {
      connected: Boolean(this.socket && this.socket.readyState === WebSocket.OPEN),
      url: this.activeUrl,
      readyState: this.socket ? this.socket.readyState : WebSocket.CLOSED,
      listenerCount: this.listeners.length,
      statusListenerCount: this.statusListeners.length
    }
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
