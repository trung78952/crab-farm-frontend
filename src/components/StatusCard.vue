<template>
  <div class="panel status-card">
    <div class="panel-body">
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <div class="text-muted small text-uppercase">{{ label }}</div>
          <div class="h4 mb-0">{{ value }}</div>
        </div>
        <span :class="['status-dot', tone]" />
      </div>
      <div v-if="detail" class="text-muted small mt-2">{{ detail }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatusCard',
  props: {
    label: { type: String, required: true },
    value: { type: [String, Number], required: true },
    detail: { type: String, default: '' },
    tone: { type: String, default: 'ok' }
  }
}
</script>
