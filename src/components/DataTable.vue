<template>
  <div class="table-responsive">
    <b-table
      small
      hover
      :items="items"
      :fields="fields"
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
export default {
  name: 'DataTable',
  props: {
    items: { type: Array, default: () => [] },
    fields: { type: Array, required: true },
    busy: { type: Boolean, default: false }
  }
}
</script>
