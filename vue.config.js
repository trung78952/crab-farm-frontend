module.exports = {
  devServer: {
    port: 8080,
    proxy: {
      '/api': {
        target: process.env.VUE_APP_DEV_PROXY_TARGET || process.env.VUE_APP_API_BASE_URL || 'http://localhost:8000',
        changeOrigin: true,
        ws: true
      },
      '/health': {
        target: process.env.VUE_APP_DEV_PROXY_TARGET || process.env.VUE_APP_API_BASE_URL || 'http://localhost:8000',
        changeOrigin: true
      },
      '/storage': {
        target: process.env.VUE_APP_DEV_PROXY_TARGET || process.env.VUE_APP_API_BASE_URL || 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
}
