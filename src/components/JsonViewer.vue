<template>
  <pre class="json-viewer">{{ pretty }}</pre>
</template>

<script>
export default {
  name: 'JsonViewer',
  props: {
    value: { type: [Object, Array, String, Number, Boolean], default: null }
  },
  computed: {
    pretty() {
      if (typeof this.value === 'string') return this.value
      return JSON.stringify(this.value || {}, null, 2)
    }
  }
}
</script>

<style scoped>
.json-viewer {
  background: #101219;
  border: 1px solid #3a3d46;
  border-radius: 4px;
  color: #92f6df;
  font-size: 12px;
  margin: 0;
  max-width: 520px;
  min-width: 260px;
  padding: 8px;
  white-space: pre-wrap;
}
</style>
