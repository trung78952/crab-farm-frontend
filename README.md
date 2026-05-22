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
- Devices: create/edit hardware devices, filter by type/status/shelf, set `stream_url`, inspect metadata and last seen state.
- Camera: capture/upload images, view large image modal, soft delete images, and render live stream from selected camera `stream_url`.

## Device And Camera Notes

- `device_code` is the human-readable code used in MQTT payloads, for example `CAM_01` or `MOTION_01`.
- `device_id` is the backend UUID used when upload/log APIs need a database reference.
- Camera online state updates in realtime from `farm/shelf/{shelf_code}/camera/status`.
- Live stream uses the URL saved on the device. The frontend renders it directly with `<img>` or `<iframe>` and does not proxy the stream through the backend.
- Browser CORS and mixed-content rules still apply to stream URLs.
