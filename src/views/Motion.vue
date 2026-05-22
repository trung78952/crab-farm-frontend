<template>
  <b-row>
    <b-col lg="6">
      <div class="panel">
        <div class="panel-header">Motion Control</div>
        <div class="panel-body">
          <b-button variant="primary" class="mr-2" @click="home">Home</b-button>
          <b-input-group class="mt-3" prepend="Tank UUID">
            <b-form-input v-model="tankId" />
            <b-input-group-append><b-button variant="outline-info" @click="move">Move</b-button></b-input-group-append>
          </b-input-group>
          <b-form-group label="G-code" class="mt-3">
            <b-form-textarea v-model="gcode" rows="5" />
          </b-form-group>
          <b-button variant="outline-info" @click="sendGcode">Send G-code</b-button>
        </div>
      </div>

    </b-col>
    <b-col lg="6">
      <div class="panel">
        <div class="panel-header">Command History</div>
        <div class="panel-body">
          <DataTable style="max-height: 50vh;" :items="commands" :fields="fields" />
        </div>
      </div>
      <div class="console-panel">{{ consoleText }}</div>
    </b-col>
  </b-row>
</template>

<script>
import DataTable from '../components/DataTable.vue'
import motionApi from '../api/motion'

export default {
  name: 'Motion',
  components: { DataTable },
  data() {
    return {
      tankId: '',
      gcode: 'G90\nG1 X120 Z300 F3000\nM400',
      commands: [],
      fields: ['cmd_id', 'command_type', 'status', 'mqtt_topic', 'created_at']
    }
  },
  computed: {
    consoleText() {
      return this.commands.slice(0, 12).map(c => `[${c.status}] ${c.cmd_id} ${c.command_type}`).join('\n')
    }
  },
  created() {
    this.$store.dispatch('startRealtime')
    this.load()
  },
  methods: {
    async load() { this.commands = (await motionApi.commands()).data },
    async home() { await motionApi.home(); await this.load() },
    async move() { await motionApi.moveToTank(this.tankId, { speed: 3000 }); await this.load() },
    async sendGcode() { await motionApi.gcode(this.gcode.split('\n').filter(Boolean)); await this.load() }
  }
}
</script>
