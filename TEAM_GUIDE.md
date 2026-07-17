# OmniMCP -- Team Integration Guide

## Current Project Status

The backend infrastructure for OmniMCP is complete.

### Implemented Components

-   ✅ NitroStack project setup
-   ✅ HardwareAdapter interface
-   ✅ AdapterManager
-   ✅ Mock ESP32 adapter
-   ✅ Mock Camera adapter
-   ✅ MCP Tools
-   ✅ MCP Resources
-   ✅ MCP Prompt
-   ✅ Automatic adapter registration
-   ✅ End-to-end verification

> **Do not modify these core components unless absolutely necessary.**

------------------------------------------------------------------------

# Project Architecture

``` text
AI Client
     │
     ▼
MCP Tools / Resources / Prompts
     │
     ▼
AdapterManager
     │
 ┌───┴───────────────┐
 │                   │
 ▼                   ▼
ESP32 Adapter     Camera Adapter
```

The **AdapterManager** is the only component that communicates with
hardware adapters.

Tools, Resources, and Prompts **must never access hardware directly**.

------------------------------------------------------------------------

# Files You Should NOT Modify

    src/adapters/adapter.ts
    src/adapters/manager.ts
    src/tools/hardware.tools.ts
    src/resources/hardware.resources.ts
    src/prompts/hardware.prompts.ts

These files form the shared infrastructure for the project.

------------------------------------------------------------------------

# Member 2 -- ESP32 Integration

## File

    src/adapters/esp32.ts

### Responsibilities

-   Replace mock implementation with real ESP32 communication.
-   Implement:
    -   `connect()`
    -   `disconnect()`
    -   `execute()`
    -   `getStatus()`
-   Keep the `HardwareAdapter` interface unchanged.

Current supported commands:

-   `read_temp`
-   `set_gpio`

You may add new commands if required, but existing commands should
continue working.

**Do not modify AdapterManager.**

------------------------------------------------------------------------

# Member 3 -- Camera Integration

## File

    src/adapters/camera.ts

### Responsibilities

Replace the mock implementation with the real camera integration.

Implement:

-   `connect()`
-   `disconnect()`
-   `execute()`
-   `getStatus()`

Current command:

-   `capture_image`

Keep the response format consistent.

------------------------------------------------------------------------

# Member 4 -- Dashboard & Presentation

Focus on:

-   Dashboard UI
-   Demo flow
-   Presentation
-   Screenshots
-   Demo recording (if required)

Avoid backend modifications unless discussed.

------------------------------------------------------------------------

# Available MCP Tools

-   `list_devices`
-   `connect_device`
-   `disconnect_device`
-   `device_status`
-   `execute_command`

These tools are already implemented.

------------------------------------------------------------------------

# Available Resources

-   `hardware://devices/available`
-   `hardware://devices/connected`
-   `hardware://system/health`

------------------------------------------------------------------------

# Available Prompt

-   `diagnose_hardware`

------------------------------------------------------------------------

# Adding a New Hardware Device

1.  Create a new adapter under:

```{=html}
<!-- -->
```
    src/adapters/

2.  Implement the `HardwareAdapter` interface.

3.  Register the adapter with `AdapterManager`.

No changes should be required to:

-   Tools
-   Resources
-   Prompts

------------------------------------------------------------------------

# Git Workflow

Before pushing:

``` bash
git pull origin main
```

Build the project:

``` bash
npm run build
```

Push only if the build succeeds.

Suggested commit messages:

    feat: integrate ESP32 communication
    feat: integrate camera module
    fix: camera connection bug

------------------------------------------------------------------------

# Development Rules

-   Do not bypass AdapterManager.
-   Do not hardcode hardware access inside MCP tools.
-   Preserve TypeScript types.
-   Return structured responses.
-   Ensure `npm run build` passes before every push.

------------------------------------------------------------------------

# Recommended Demo Flow

1.  Start OmniMCP
2.  List available devices
3.  Connect ESP32
4.  Read machine temperature
5.  Toggle GPIO (conveyor simulation)
6.  Connect Camera
7.  Capture inspection image
8.  Show system health
9.  Disconnect devices

------------------------------------------------------------------------

# Troubleshooting

If something breaks:

``` bash
npm run build
```

Then:

``` bash
npm run dev
```

Verify:

-   `list_devices`
-   `device_status`
-   `execute_command`

If these work, the backend is healthy.

------------------------------------------------------------------------

# Project Goal

OmniMCP provides a standardized MCP interface for heterogeneous factory
hardware, allowing AI agents to interact with different devices through
a single, extensible abstraction layer.

Keep the architecture modular, avoid breaking shared infrastructure, and
prioritize successful integration over unnecessary refactoring.
