<template>
  <div class="table-responsive">
    <b-table
      small
      hover
      :items="items"
      :fields="formattedFields"
      :busy="busy"
      class="table-darkish mb-0"
      tbody-tr-class="table-row"
      show-empty
    >
      <template #cell(actions)="slot">
        <slot name="actions" v-bind="slot" />
      </template>
      <template #cell(payload)="slot">
        <slot name="payload" v-bind="slot" />
      </template>
      <template #empty>
        <div class="text-muted py-3">No data</div>
      </template>
    </b-table>
  </div>
</template>

<script>
import { formatDateTime, isDateTimeField } from '../utils/dateTime'

export default {
  name: 'DataTable',
  props: {
    items: { type: Array, default: () => [] },
    fields: { type: Array, required: true },
    busy: { type: Boolean, default: false }
  },
  computed: {
    formattedFields() {
      return this.fields.map((field) => {
        const normalizedField =
          typeof field === 'string' ? { key: field } : { ...field }

        if (!normalizedField.formatter && isDateTimeField(normalizedField.key)) {
          normalizedField.formatter = (value) => formatDateTime(value)
        }

        return normalizedField
      })
    }
  }
}
</script>
