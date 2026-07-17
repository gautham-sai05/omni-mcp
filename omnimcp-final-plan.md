# OmniMCP
## Universal Hardware Capability Layer for Manufacturing AI
### Final Build Plan — NitroStack × Amrita University MCP Hackathon | Track: Manufacturing & Industry 4.0

Single reference for the team and coding agent. Everything else needed is the real NitroStack repo for exact syntax: **https://github.com/nitrocloudofficial/nitrostack**

---

## 1. Executive Summary

**Tagline:** One MCP Interface. Infinite Hardware Capabilities.

**Elevator pitch:** Factories run sensors, cameras, controllers, and PLCs from different vendors, each needing custom software before AI can use them. OmniMCP replaces device-specific integration with a single capability layer built on MCP. Once an adapter exists for a device, any MCP-compatible AI can discover and use it immediately.

**Analogy for judges:** JDBC for hardware — one interface, many implementations underneath.

**Why this beats the obvious ideas:** most teams will build some version of "AI diagnoses a machine error using sensor data + manual + history." Assume 20-30+ teams converge on this independently. OmniMCP is infrastructure, not an app — structurally different.

---

## 2. THE INTEGRATION PROBLEM — READ THIS FIRST

The single biggest way hackathon teams lose points isn't a weak idea — it's four people building in isolation for 18 hours and then discovering at hour 19 that nobody's code fits together. This plan is structured specifically to prevent that. Follow the rules below exactly.

### Rule 1: One person owns the running server, from hour 0.
Designate **Member 1 as Integration Owner**. Their machine (or a shared repo everyone pushes to) is the single source of truth for `omnimcp/`. Nobody else runs a separate, divergent copy of the server. Everyone else writes their piece as an isolated module and hands it to the Integration Owner to wire in — they do not try to run the full MCP server themselves unless they've pulled the latest from the shared repo first.

### Rule 2: Use a shared GitHub repo from minute one, not a merge-at-the-end plan.
```
git init omnimcp
git remote add origin <your-repo-url>
```
Every member pushes to their own branch (`esp32-adapter`, `camera-adapter`, `dashboard-widget`) and opens a PR into `main` as soon as their isolated piece works standalone. The Integration Owner merges continuously, not all at once at hour 18.

### Rule 3: Every module must work standalone before it's handed off.
- ESP32 person tests their adapter with a **standalone Node script** that calls `discover()` / `invoke()` directly — no MCP server needed to verify the adapter itself works.
- Camera person does the same.
- Dashboard person builds the widget against **fake mock data** first, then swaps in real tool output only once Tools are ready.

This means if hour 15 arrives and integration hasn't happened yet, every piece still individually *works and can be demoed separately* — worst case, you demo three separate working things instead of zero integrated things.

### Rule 4: Deployability checkpoint — can ONE laptop run the whole thing?
By hour 14, the Integration Owner must be able to clone the repo fresh onto their own laptop, run `npm install && npm run dev`, and have discovery/tools work end-to-end (hardware plugged into that laptop, or reachable over the same WiFi). **This is your single-system deployability test.** If it fails, that's your signal to simplify — drop the stretch goal immediately, don't wait until hour 18 to find out.

### Rule 5: NitroCloud deployment is one person's job, started early.
Assign Member 1 to attempt a NitroCloud deploy **the moment there's anything running (even the scaffold with zero adapters, around hour 3-4)** — a trivial early deploy that works tells you the deployment path is fine, so the *real* deploy at hour 16 is just pushing updated code, not debugging deployment mechanics under time pressure for the first time.

---

## 3. Problem Statement (for the PPT)

Production lines contain temperature sensors, PLCs, edge controllers, cameras, conveyors, and robots — each from a different vendor, each with different protocols and SDKs. Building AI that monitors a line means solving the same integration problem once per device. **The AI isn't the hard part. The integration is.**

```
Traditional:                      OmniMCP:
AI → ESP32 SDK → ESP32            AI → OmniMCP → Capability → Adapter → ESP32
AI → Camera SDK → Camera          AI → OmniMCP → Capability → Adapter → Camera
(nothing reusable)                (AI layer never changes — only adapters do)
```

---

## 4. Design Principles

1. **Capability first** — AI understands "Machine Temperature," never "ADC Channel 0."
2. **Hardware independence** — swap ESP32 for Raspberry Pi by replacing only the adapter.
3. **Extensibility** — new hardware added without touching the MCP layer.
4. **Discoverability** — capabilities found dynamically, never hardcoded.
5. **Modularity** — one adapter failing never breaks another.
6. **Standardization** — every adapter implements the exact same interface.

---

## 5. Final Scope

### Building (priority order — never cut):
1. `DeviceAdapter` interface + `AdapterManager`
2. ESP32 adapter — **Machine Temperature** + **Conveyor Output** capabilities
3. Camera adapter — **Inspection Camera** capability
4. MCP Tools wrapping both adapters
5. MCP Resources: `hardware/devices`, `hardware/capabilities`, `hardware/logs`
6. MCP Prompt: `diagnose_hardware`
7. Widget: live dashboard
8. NitroCloud deployment
9. Verify a second MCP client (ChatGPT or NitroChat) can connect and call your tools — **not just NitroStudio**

### Explicitly NOT building:
- ❌ Real relay/mains control (narrate the LED as "conveyor output," don't wire an actual relay)
- ❌ RAG over manuals/SOPs
- ❌ Predictive maintenance / autonomous diagnosis
- ❌ Workflow/playbook engine
- ❌ ERP/SAP/Slack/email integrations
- ❌ PLC, CAN, Bluetooth, I²C, SPI adapters — mention as future work only
- ❌ Autonomous/auto-executed recovery actions

**One approved stretch goal if ahead of schedule:** the "plug in a second device live" demo moment.

### Success criteria:
- ✅ NitroStudio connects successfully
- ✅ `discover_devices` lists hardware dynamically
- ✅ Live Machine Temperature reads correctly
- ✅ Conveyor Output (LED) can be controlled
- ✅ Inspection Camera captures an image
- ✅ Widget displays live state
- ✅ Server deploys successfully to NitroCloud
- ✅ A second MCP client (ChatGPT/NitroChat) successfully calls the deployed tools

---

## 6. Architecture

```
                    MCP Clients
      ┌────────────────────────────────┐
      │ ChatGPT │ NitroStudio │ NitroChat │
      └────────────────────────────────┘
                    │
              MCP Protocol
                    │
        ┌──────────────────────┐
        │       OmniMCP        │
        └──────────────────────┘
                    │
      ┌────────────────────────────┐
      │ Capability Discovery Engine│
      │ Capability Registry        │
      │ Adapter Manager            │
      └────────────────────────────┘
                    │
     ┌──────────────┴───────────────┐
     │                               │
 ESP32 Adapter                 Camera Adapter
 Machine Temperature           Inspection Camera
 Conveyor Output                Image Capture
```

### Repository structure
```
omnimcp/
├── src/
│   ├── adapters/
│   │   ├── adapter.ts       ← shared interface (Integration Owner writes this FIRST, hour 0-2)
│   │   ├── manager.ts       ← shared (Integration Owner)
│   │   ├── esp32.ts         ← Member 2, standalone-testable
│   │   └── camera.ts        ← Member 3, standalone-testable
│   ├── tools/
│   │   └── hardware.tools.ts ← Integration Owner, wires adapters in once ready
│   ├── resources/
│   │   ├── devices.ts
│   │   └── logs.ts
│   ├── prompts/
│   │   └── diagnose.ts
│   ├── widgets/
│   │   └── dashboard.tsx    ← Member 4, built against mock data first
│   ├── server.ts
│   └── index.ts
├── firmware/esp32/firmware.ino  ← Member 2
├── package.json
```
Accept whatever `npx @nitrostack/cli init` actually scaffolds — add these folders alongside it.

---

## 7. Core Interface — Adapter Contract (write this FIRST, hour 0-2, before anyone splits off)

```ts
// src/adapters/adapter.ts
export interface DeviceInfo {
  id: string;
  type: string;
  name: string;
  connected: boolean;
}

export interface DeviceStatus {
  id: string;
  online: boolean;
  lastSeen: string;
}

export interface DeviceAdapter {
  discover(): Promise<DeviceInfo[]>;
  getCapabilities(deviceId: string): Promise<string[]>;
  invoke(deviceId: string, capability: string, params?: Record<string, any>): Promise<any>;
  getStatus(deviceId: string): Promise<DeviceStatus>;
}
```

```ts
// src/adapters/manager.ts
import { DeviceAdapter, DeviceInfo } from './adapter';

export class AdapterManager {
  private adapters: DeviceAdapter[] = [];
  register(adapter: DeviceAdapter) { this.adapters.push(adapter); }

  async discoverAll(): Promise<DeviceInfo[]> {
    const results = await Promise.all(this.adapters.map(a => a.discover()));
    return results.flat();
  }

  async invoke(deviceId: string, capability: string, params?: Record<string, any>) {
    for (const adapter of this.adapters) {
      const devices = await adapter.discover();
      if (devices.some(d => d.id === deviceId)) {
        return adapter.invoke(deviceId, capability, params);
      }
    }
    throw new Error(`Device ${deviceId} not found`);
  }
}
```

**This file is the contract between all four members. Once it's written and pushed (hour 2), everyone else builds against it independently without waiting on each other.**

---

## 8. ESP32 Adapter — Member 2

**Standalone test first** (before touching the MCP server at all):
```ts
// test-esp32-standalone.ts — run this alone to verify hardware works
const adapter = new Esp32Adapter('http://192.168.1.50');
adapter.discover().then(console.log);
```

**Firmware:**
```cpp
// firmware/esp32/firmware.ino
#include <WiFi.h>
#include <WebServer.h>
WebServer server(80);

void handleTemp() {
  float temp = readTemperature();
  server.send(200, "application/json", "{\"temperature\":" + String(temp) + "}");
}

void handleGpioWrite() {
  int pin = server.arg("pin").toInt();
  int value = server.arg("value").toInt();
  pinMode(pin, OUTPUT);
  digitalWrite(pin, value);
  server.send(200, "application/json", "{\"ok\":true}");
}

void setup() {
  WiFi.begin("SSID", "PASSWORD");
  while (WiFi.status() != WL_CONNECTED) delay(500);
  server.on("/temp", handleTemp);
  server.on("/gpio/write", handleGpioWrite);
  server.begin();
}
void loop() { server.handleClient(); }
```

**TypeScript adapter:**
```ts
// src/adapters/esp32.ts
import { DeviceAdapter, DeviceInfo, DeviceStatus } from './adapter';

export class Esp32Adapter implements DeviceAdapter {
  constructor(private baseUrl: string, private deviceId: string = 'esp32-1') {}

  async discover(): Promise<DeviceInfo[]> {
    try {
      const res = await fetch(`${this.baseUrl}/temp`, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) return [];
      return [{ id: this.deviceId, type: 'esp32', name: 'Machine Controller (ESP32)', connected: true }];
    } catch { return []; }
  }

  async getCapabilities(): Promise<string[]> { return ['machine.temperature', 'conveyor.output']; }

  async invoke(deviceId: string, capability: string, params?: Record<string, any>) {
    if (capability === 'machine.temperature') {
      const res = await fetch(`${this.baseUrl}/temp`);
      return res.json();
    }
    if (capability === 'conveyor.output') {
      const res = await fetch(`${this.baseUrl}/gpio/write?pin=${params?.pin}&value=${params?.value}`);
      return res.json();
    }
    throw new Error(`Unsupported capability: ${capability}`);
  }

  async getStatus(): Promise<DeviceStatus> {
    const devices = await this.discover();
    return { id: this.deviceId, online: devices.length > 0, lastSeen: new Date().toISOString() };
  }
}
```

---

## 9. Camera Adapter — Member 3

Decide USB webcam (`node-webcam`/ffmpeg) vs. ESP32-CAM HTTP frame pull **in the first 30 minutes of this task**, not hour 9. ESP32-CAM usually wins — reuses the ESP32 comms pattern.

```ts
// src/adapters/camera.ts
import { DeviceAdapter, DeviceInfo, DeviceStatus } from './adapter';

export class CameraAdapter implements DeviceAdapter {
  constructor(private captureUrl: string, private deviceId: string = 'camera-1') {}

  async discover(): Promise<DeviceInfo[]> {
    try {
      const res = await fetch(this.captureUrl, { method: 'HEAD', signal: AbortSignal.timeout(2000) });
      return res.ok ? [{ id: this.deviceId, type: 'camera', name: 'Inspection Camera', connected: true }] : [];
    } catch { return []; }
  }

  async getCapabilities(): Promise<string[]> { return ['inspection.capture']; }

  async invoke(deviceId: string, capability: string): Promise<any> {
    if (capability === 'inspection.capture') {
      const res = await fetch(this.captureUrl);
      const buffer = await res.arrayBuffer();
      return { imageBase64: Buffer.from(buffer).toString('base64'), mimeType: 'image/jpeg' };
    }
    throw new Error(`Unsupported capability: ${capability}`);
  }

  async getStatus(): Promise<DeviceStatus> {
    const devices = await this.discover();
    return { id: this.deviceId, online: devices.length > 0, lastSeen: new Date().toISOString() };
  }
}
```

---

## 10. MCP Layer — Tools, Resources, Prompt, Widget — Member 1 (Integration Owner)

**Real NitroStack syntax — decorator-based. Verify exact names against the repo before finalizing.**

```ts
// src/tools/hardware.tools.ts
import { McpApp, Module, ToolDecorator as Tool, z, ExecutionContext } from '@nitrostack/core';
import { AdapterManager } from '../adapters/manager';
import { logReading } from '../resources/logs';

export class HardwareTools {
  constructor(private adapterManager: AdapterManager) {}

  @Tool({ name: 'discover_devices', description: 'List all currently connected hardware devices', inputSchema: z.object({}) })
  async discoverDevices(input: {}, ctx: ExecutionContext) {
    ctx.logger.info('Discovering devices');
    return this.adapterManager.discoverAll();
  }

  @Tool({ name: 'describe_device', description: 'List capabilities of a specific device', inputSchema: z.object({ deviceId: z.string() }) })
  async describeDevice(input: { deviceId: string }, ctx: ExecutionContext) {
    return this.adapterManager.getCapabilities(input.deviceId);
  }

  @Tool({ name: 'read_machine_temperature', description: 'Read the live machine temperature', inputSchema: z.object({ deviceId: z.string() }) })
  async readTemperature(input: { deviceId: string }, ctx: ExecutionContext) {
    const reading = await this.adapterManager.invoke(input.deviceId, 'machine.temperature');
    await logReading(input.deviceId, reading);
    return reading;
  }

  @Tool({ name: 'set_conveyor_output', description: 'Turn the conveyor output on or off', inputSchema: z.object({ deviceId: z.string(), pin: z.number(), value: z.number() }) })
  async setConveyorOutput(input: { deviceId: string; pin: number; value: number }, ctx: ExecutionContext) {
    return this.adapterManager.invoke(input.deviceId, 'conveyor.output', { pin: input.pin, value: input.value });
  }

  @Tool({ name: 'capture_inspection_image', description: 'Capture an image from the inspection camera', inputSchema: z.object({ deviceId: z.string() }) })
  async captureImage(input: { deviceId: string }, ctx: ExecutionContext) {
    return this.adapterManager.invoke(input.deviceId, 'inspection.capture');
  }
}
```

**Resources:**
```ts
// src/resources/devices.ts — hardware/devices
export async function getDevicesResource(adapterManager: AdapterManager) {
  return adapterManager.discoverAll();
}
```
```ts
// src/resources/logs.ts — hardware/logs, SQLite
import Database from 'better-sqlite3';
const db = new Database('hardware.db');
db.exec(`CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY AUTOINCREMENT, deviceId TEXT, reading TEXT, timestamp TEXT)`);

export async function logReading(deviceId: string, reading: any) {
  db.prepare('INSERT INTO logs (deviceId, reading, timestamp) VALUES (?, ?, ?)').run(deviceId, JSON.stringify(reading), new Date().toISOString());
}
export async function getLogsResource(deviceId?: string) {
  return deviceId
    ? db.prepare('SELECT * FROM logs WHERE deviceId = ? ORDER BY id DESC LIMIT 50').all(deviceId)
    : db.prepare('SELECT * FROM logs ORDER BY id DESC LIMIT 50').all();
}
```

**Prompt:**
```ts
// src/prompts/diagnose.ts
export const diagnoseHardwarePrompt = {
  name: 'diagnose_hardware',
  description: 'Discover hardware, read live sensor data, flag anomalies, and summarize',
  template: `
Discover all connected devices.
For each device with a temperature capability, read its current value.
If any reading is outside expected range (e.g. > 40°C), flag it as an anomaly.
If a camera is connected and an anomaly was flagged, capture an image as evidence.
Summarize findings in plain language for a factory operator.
`
};
```

**Widget — Member 4, build against mock data first:**
```tsx
// src/widgets/dashboard.tsx
export function HardwareDashboard({ devices, lastReading, lastImage }: any) {
  return (
    <div style={{ padding: 16 }}>
      <h3>Connected Devices</h3>
      <ul>{devices?.map((d: any) => <li key={d.id}>{d.name} — {d.connected ? 'online' : 'offline'}</li>)}</ul>
      {lastReading && <p>Machine Temperature: {JSON.stringify(lastReading)}</p>}
      {lastImage && <img src={`data:image/jpeg;base64,${lastImage}`} width={240} />}
    </div>
  );
}
```

---

## 11. Build Sequence — SDK → Studio → Cloud

| Phase | Time | Task | Owner | Done when |
|---|---|---|---|---|
| 1. Scaffold + repo | 0–2h | `npx @nitrostack/cli init`, push shared repo, write `adapter.ts` + `manager.ts` | M1 | Repo exists, everyone has cloned it, contract file merged |
| 1b. Trial cloud deploy | 3–4h | Deploy the empty scaffold to NitroCloud, confirm it responds | M1 | A live URL returns *something* — proves the pipe works |
| 2. ESP32 adapter | 2–9h | Firmware + `Esp32Adapter`, standalone-tested, then PR into repo | M2 | Standalone script shows real temp reading; PR merged |
| 3. Camera adapter | 2–11h | `CameraAdapter`, standalone-tested, then PR into repo | M3 | Standalone script returns a real image; PR merged |
| 4. Tools/Resources/Prompt | 9–13h | Wire both adapters into `HardwareTools`, resources, prompt | M1 | All 5 tools callable in NitroStudio |
| 5. Widget | 2–14h (parallel) | Build against mock data, swap to real tool output once #4 is merged | M4 | Dashboard renders live device list + reading |
| 6. Single-system checkpoint | 14h | Fresh clone on Integration Owner's laptop, full run end-to-end | M1 | Discovery + all tools work from one machine |
| 7. NitroStudio testing | 14–16h | Every tool tested individually | All | Every tool verified 3x+ |
| 8. NitroCloud deploy (real) | 16–18h | Deploy final code | M1 | Deployed link works from a fresh browser session |
| 9. Second MCP client test | 17–18h | Connect ChatGPT or NitroChat to the deployed server, call a tool | M1 | A tool call succeeds from a client other than NitroStudio |
| 10. Demo + PPT + video | 18–20h | Full rehearsal 10+ times, record backup video | All | Backup video matches the live script exactly |

---

## 12. Team Split (integration-safe)

- **Member 1 — Integration Owner / Core MCP:** owns the repo, writes the adapter contract first, wires Tools/Resources/Prompt, does the trial + real Cloud deploys, tests the second-client connection. **If only one person can do the final integration, it's this person — make sure they understand every other module's interface, not just their own code.**
- **Member 2 — ESP32:** firmware, `Esp32Adapter`, tested standalone before handoff
- **Member 3 — Camera & Discovery:** `CameraAdapter`, tested standalone before handoff
- **Member 4 — Dashboard & Demo:** widget (mock data first), SQLite wiring, PPT, demo video, rehearsal timing

**If your team ends up needing ONE person to do all integration alone** (e.g., others' laptops/setups don't cooperate): that person needs, by hour 12, (a) the merged `adapter.ts`/`manager.ts` contract, (b) both adapters as working standalone files (even if not yet PR'd cleanly), and (c) the widget as a working mock component. Wiring three ready-made, independently-tested pieces together takes 2-3 hours, not the whole hackathon — which is exactly why Rule 3 (standalone-testable modules) matters more than any other rule in this document.

---

## 13. Demo Script (2 minutes, timed)

**Before judges arrive:** ESP32 powered on and WiFi-connected, camera tested, NitroStudio open with OmniMCP connected, backup video cued up on a second tab, and — if time allows — a second client (ChatGPT/NitroChat) also connected and ready as proof of interoperability.

| Time | Action | Say this |
|---|---|---|
| 0:00–0:10 | Open NitroStudio, show "OmniMCP Connected" | "One MCP interface for any hardware." |
| 0:10–0:25 | *"What hardware is connected?"* | Machine Controller + Inspection Camera listed live |
| 0:25–0:40 | *"What can the machine controller do?"* | Machine Temperature, Conveyor Output — not hardcoded |
| 0:40–0:55 | *"Read the machine temperature."* | Real value. "Live reading, not mock data." |
| 0:55–1:10 | *"Turn on the conveyor output."* | Physical LED turns on. "AI just physically controlled hardware." |
| 1:10–1:25 | *"Capture an inspection image."* | Real photo appears. |
| 1:25–1:45 | **Kill shot:** plug in a second device live, ask *"Discover devices again."* | Appears — zero code changes. |
| 1:45–2:00 | Close + (if set up) switch to ChatGPT/NitroChat and repeat one query | "Same server, different client — that's real interoperability, not a demo trick." |

**If live hardware glitches:** say "let me show the recorded run" and play the backup video immediately.

---

## 14. PPT — 5 Slides

1. **Problem** — every hardware integration for AI is custom-built; doesn't scale
2. **Solution** — capability abstraction, one MCP interface, pluggable adapters
3. **Architecture** — diagram + `DeviceAdapter` interface snippet
4. **Live demo** — screenshots/GIF of the plug-in moment + the second-client connection
5. **Impact** — *"Adding a new sensor to an AI-monitored system today means writing a custom driver — hours of engineering per device. With OmniMCP it's zero. Applies across factory monitoring, robotics, and wearables."*

---

## 15. Judge Q&A Prep

**Why MCP?** Standardizes AI-hardware interaction through discoverable tools/resources/prompts — different AI clients work with the same interface, no custom wiring per client.

**Why not connect directly to the ESP32?** Direct integration is vendor-specific; adapters separate hardware comms from AI interaction.

**What's the actual innovation?** Capability abstraction — hardware becomes discoverable capabilities, not device-specific APIs.

**How is this different from an IoT dashboard?** Dashboards visualize hardware for humans. This standardizes how AI systems discover and act on hardware.

**Does this scale?** Yes — new hardware only needs a new adapter with the same interface.

---

## 16. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Team can't merge code at the end | Rules in Section 2 — shared repo from hour 0, standalone-testable modules, continuous PRs |
| ESP32 WiFi drops during demo | Test venue WiFi in advance; hotspot fallback; simulator mode as last resort |
| Camera driver/USB issues | Test the exact hardware combo days in advance; sample image fallback |
| "Plug in new device" glitches live | Rehearse 10+ times; backup video ready instantly |
| NitroCloud deploy fails near deadline | Trial deploy at hour 3-4 catches pipeline issues early; real deploy at hour 16, not 19 |
| Second-client connection fails | Test this by hour 17, not minutes before demo — it's an explicit judging checklist item |
| Team runs over on adapters | Section 5's cut list is non-negotiable |

---

## 17. Judging Criteria Mapping — Explicit Checklist

| Requirement | How this project demonstrates it |
|---|---|
| ✅ MCP Tools | `discover_devices`, `describe_device`, `read_machine_temperature`, `set_conveyor_output`, `capture_inspection_image` |
| ✅ MCP Resources | `hardware/devices`, `hardware/capabilities`, `hardware/logs` (SQLite-backed, persisted) |
| ✅ MCP Prompts | `diagnose_hardware` — multi-step orchestration prompt |
| ✅ MCP Widgets | Live dashboard via `@Widget`, attached to tool output |
| ✅ NitroStudio testing | Every tool manually verified before Cloud deploy (Phase 7) |
| ✅ NitroCloud deployment | Trial deploy early (Phase 1b) + real deploy (Phase 8) |
| ✅ External integration | Real hardware (ESP32 + camera) = real external data source; satisfies Completeness criterion directly |
| ✅ Second MCP client | ChatGPT or NitroChat connects to the deployed server and calls a tool (Phase 9) — don't skip this, it's explicitly called out as a requirement |

| Judging Category | Weight | Where we earn it |
|---|---|---|
| Technical Quality | 25% | Real adapter interface, real decorators, error handling everywhere |
| Innovation & Creativity | 25% | Capability abstraction, not another diagnose-bot |
| Real-World Impact | 20% | Quantified integration-time-saved claim, named downstream users |
| Demo & Presentation | 15% | Rehearsed script, plug-in moment, second-client proof |
| Completeness | 10% | Real hardware, deployed and verified end-to-end |
| Community | 5% | Discord/Reddit/GitHub post after submission |

---

## 18. Future Roadmap (mention only, don't build)

PLC (Modbus/OPC-UA) · CAN Bus · Bluetooth Low Energy · Industrial Robots · CNC Machines · Barcode/RFID Readers · Smart Energy Meters.

---

## 19. Final Pitch

> OmniMCP is a universal hardware capability layer built on the Model Context Protocol. Instead of requiring AI systems to integrate separately with every industrial device, OmniMCP transforms heterogeneous hardware into standardized, discoverable capabilities. A modular adapter architecture lets any MCP-compatible AI monitor and control factory hardware without vendor-specific integration.

---

*Before writing NitroStack-specific code, verify exact decorator names, method signatures, and folder conventions against the real repo: https://github.com/nitrocloudofficial/nitrostack*
