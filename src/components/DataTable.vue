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
      :primary-key="primaryKey"
      :tbody-transition-props="transProps"
      show-empty
    >
      <template v-for="field in formattedFields" v-slot:[cellSlot(field.key)]="slot">
        <slot :name="field.key" v-bind="slot">{{ slot.value }}</slot>
      </template>
      <template #empty>
        <div class="text-muted py-3">No data</div>
      </template>
    </b-table>
  </div>
</template>

<script>
import { formatDateTime, isDateTimeField } from "../utils/dateTime";

export default {
  name: "DataTable",
  props: {
    items: { type: Array, default: () => [] },
    fields: { type: Array, required: true },
    busy: { type: Boolean, default: false },
    primaryKey: { type: String, default: "id" },
  },
  data() {
    return {
      transProps: {
        name: "flip-list",
      },
    };
  },
  computed: {
    formattedFields() {
      return this.fields.map((field) => {
        const normalizedField =
          typeof field === "string" ? { key: field } : { ...field };

        if (
          !normalizedField.formatter &&
          isDateTimeField(normalizedField.key)
        ) {
          normalizedField.formatter = (value) => formatDateTime(value);
        }

        return normalizedField;
      });
    },
  },
  methods: {
    cellSlot(key) {
      return `cell(${key})`;
    },
  },
};
</script>
<style>
table#table-transition-example .flip-list-move {
  transition: transform 0.5s;
}
</style>
