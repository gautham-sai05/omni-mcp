# OmniMCP — Universal Factory Hardware Abstraction Layer

OmniMCP is a Model Context Protocol (MCP) server built on **NitroStack** that serves as a universal hardware abstraction layer for the NitroStack × Amrita University Hackathon. It decouples LLM-based orchestration from vendor-specific hardware SDKs, providing a standard interface for factory machine controllers and inspection cameras.

---

## Key Features

- **Decoupled Architecture**: Abstract hardware interactions using a unified `HardwareAdapter` interface and registry-based `AdapterManager`.
- **Automatic Bootstrapping**: Uses dependency injection and NitroStack lifecycle hooks to resolve and initialize hardware adapters automatically on startup.
- **MCP Tools**: Full remote orchestration tools for machine state and commands (`list_devices`, `connect_device`, `disconnect_device`, `device_status`, `execute_command`).
- **MCP Resources**: Read-only inspection interfaces for hardware availability, connection status, and system health (`hardware://devices/available`, `hardware://devices/connected`, `hardware://system/health`).
- **Safety Prompts**: Pre-packaged safety guidance (`diagnose_hardware` prompt) directing AI models to safely discover and check devices before executing actions.

---

## Architecture Diagram

```text
       AI Client (Claude / NitroStudio)
                    │
                    ▼
     MCP Tools / Resources / Prompts
                    │
                    ▼
              AdapterManager
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
   ESP32 Adapter         Camera Adapter
(Machine Controller)   (Inspection Camera)
```

---

## Project Structure

```text
├── src/
│   ├── adapters/
│   │   ├── adapter.ts       # HardwareAdapter interface & status contracts
│   │   ├── manager.ts       # AdapterManager registry & DI container lifecycle
│   │   ├── esp32.ts         # Mock Machine Controller (ESP32) implementation
│   │   └── camera.ts        # Mock Inspection Camera implementation
│   ├── tools/
│   │   ├── hardware.tools.ts     # MCP Tools (list_devices, execute_command, etc.)
│   │   ├── hardware.resources.ts # MCP Resources (available_devices, health, etc.)
│   │   ├── hardware.prompts.ts   # AI Orchestration Prompt (diagnose_hardware)
│   │   └── hardware.module.ts    # Hardware DI Module
│   ├── app.module.ts        # Root application module
│   ├── test-adapters.ts     # Automated verification harness
│   └── index.ts             # Server entry point
├── dist/                    # Compiled production build
└── TEAM_GUIDE.md            # Integration guide for Member 2 & Member 3
```

---

## Getting Started

### 1. Prerequisites
Ensure you have the hackathon environment prepared:
- Node.js LTS (v20+) & npm
- Local NitroStack monorepo globally linked

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Build & Local Verification
Build the TypeScript files and run the end-to-end verification script:
```bash
npm run build
node dist/test-adapters.js
```

### 4. Running the Dev Server
Start the NitroStack development server:
```bash
npm run dev
```

---

## Testing with NitroStudio

1. Stop any terminal-based running servers (`npm run dev`) to avoid port collisions on port `3001`.
2. Open NitroStudio (e.g. using the custom "NitroStudio" shortcut in your application launcher).
3. Select your `omni-mcp` project folder.
4. Select **STDIO** as the transport type.
5. Click **Connect**. NitroStudio will spawn the server process directly and load all widgets, tools, and resources automatically.
