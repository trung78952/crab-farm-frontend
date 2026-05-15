# Crab Farm Frontend

Vue 2 dashboard for Crab Farm AI.

## Local development

```bash
cd crab-farm-frontend
npm install
npm run serve
```

Default URL: http://localhost:8080

Create `.env.local` if needed:

```bash
VUE_APP_API_BASE_URL=http://localhost:8000
```

Login with the backend seed admin:

- username: `admin`
- password: `admin123`

## Main Pages

- Dashboard: realtime server/MQTT/WS, simulation banner, tank status, scan jobs, sensor alerts, readings, detections and MQTT logs.
- Farm Layout: combined Shelves -> Tanks parent-child view with table/grid layout, edit shelf/tank, scan tank and move to tank.
- Sensors: sensor types, sensors, readings, alert rules and alerts.
- Scan Schedules: USER/AUTO schedules, `run_immediately`, enable/disable/cancel.
- MQTT Console: all topics, contains filter, realtime logs, local clear and publish.
