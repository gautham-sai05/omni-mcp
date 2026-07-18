# OmniMCP — The Universal Interface Between AI and Industrial Hardware

> A universal hardware capability layer that enables AI agents to discover, monitor, and control industrial devices through the Model Context Protocol (MCP).

![Model Context Protocol](https://img.shields.io/badge/Model%20Context%20Protocol-MCP-blue)
![Built with NitroStack](https://img.shields.io/badge/Built%20with-NitroStack-0A66FF)
![Status](https://img.shields.io/badge/status-live-brightgreen)

**OmniMCP** is an MCP server built using **NitroStack** that provides a unified interface between AI applications and industrial hardware. Instead of building custom integrations for every device, OmniMCP allows hardware to be connected through lightweight adapters that expose standardized capabilities via the **Model Context Protocol (MCP)**.

Our prototype currently includes an **ESP32 Machine Controller** and an **Inspection Camera Adapter**, with an architecture designed to support PLCs, CNC machines, robots, sensors, and other Industry 4.0 devices.

---

# Table of Contents

- [Overview](#overview)
- [What is MCP?](#what-is-mcp)
- [Features](#features)
- [Live Demo](#live-demo)
- [Available Hardware](#available-hardware)
- [Available MCP Tools](#available-mcp-tools)
- [Getting Started](#getting-started)
- [Connect to an MCP Client](#connect-to-an-mcp-client)
- [Architecture](#architecture)
- [Future Roadmap](#future-roadmap)
- [Built with NitroStack](#built-with-nitrostack)
- [Team](#team)
- [License](#license)

---

# Overview

Industrial hardware typically exposes different APIs, SDKs, and communication protocols, making AI integration complex and difficult to scale.

OmniMCP solves this by introducing a universal hardware capability layer built on the **Model Context Protocol (MCP)**.

Each supported device is wrapped in a lightweight adapter that exposes common capabilities such as:

- Machine control
- Device monitoring
- Image capture
- Sensor access

This allows AI assistants to interact with different hardware through a single, standardized interface without worrying about vendor-specific implementations.

---

# What is MCP?

The **Model Context Protocol (MCP)** is an open standard that enables AI assistants to securely interact with external tools, services, and hardware.

OmniMCP exposes industrial devices as **MCP Tools**, **Resources**, and **Prompts**, making them compatible with clients such as:

- Claude Desktop
- Cursor
- NitroStudio
- MCP Inspector
- Any MCP-compatible client

---

# Features

- Universal hardware abstraction layer
- Modular adapter-based architecture
- ESP32 Machine Controller
- Inspection Camera Adapter
- Automatic hardware discovery
- Device connection management
- MCP Tools
- MCP Resources
- MCP Prompts
- Built and deployed using NitroStack
- Easily extendable for future industrial hardware

---

# Live Demo

### 🚀 Live MCP Endpoint

```
https://omnimcp-6a5b3a86-d4rk-null-amrita-university-amritapuri-campus.app.nitrocloud.ai
```

### 💻 GitHub Repository

```
https://github.com/gautham-sai05/omni-mcp
```

---

# Available Hardware

## ESP32 Machine Controller

Capabilities:

- Connect to hardware
- Execute commands
- Read device status
- Simulate industrial machine control

---

## Inspection Camera Adapter

Capabilities:

- Capture inspection images
- Standardized image responses
- Laptop webcam support
- Ready for ESP32-CAM integration

---

# Available MCP Tools

| Tool | Description |
|------|-------------|
| `list_devices` | Discover registered hardware |
| `connect_device` | Connect to a hardware adapter |
| `disconnect_device` | Disconnect hardware |
| `device_status` | Retrieve current device status |
| `execute_command` | Execute adapter-specific commands |

---

# Available MCP Resources

```
hardware://devices/available

hardware://devices/connected

hardware://system/health
```

---

# Getting Started

## Install

```bash
git clone https://github.com/gautham-sai05/omni-mcp.git

cd omni-mcp

npm install
```

## Configure

Copy the environment file.

```bash
cp .env.example .env
```

Example:

```env
PORT=3000

CAMERA_SOURCE=laptop

ESP32_CAM_URL=http://192.168.1.xxx
```

## Run

```bash
npm run build

npm run start
```

The MCP endpoint will be available at

```
http://localhost:3000/mcp
```

---

# Connect to an MCP Client

Example MCP configuration:

```json
{
  "mcpServers": {
    "omnimcp": {
      "url": "https://omnimcp-6a5b3a86-d4rk-null-amrita-university-amritapuri-campus.app.nitrocloud.ai"
    }
  }
}
```

Compatible with:

- Claude Desktop
- Cursor
- NitroStudio
- MCP Inspector

---

# Architecture

```text
                 AI Client
      (Claude / Cursor / NitroStudio)
                    │
                    ▼
               OmniMCP Server
                    │
             Adapter Manager
          ┌─────────┴─────────┐
          ▼                   ▼
   ESP32 Adapter       Camera Adapter
          │                   │
          ▼                   ▼
   Machine Controller   Inspection Camera
```

---

# Future Roadmap

Planned hardware adapters include:

- PLCs
- Robot Arms
- CNC Machines
- Modbus Devices
- MQTT Devices
- OPC-UA
- Industrial Sensors
- AI-powered Vision Systems
- Digital Twin Integration

---

# Built with NitroStack

OmniMCP was developed and deployed using **NitroStack**, which simplified building an MCP server by providing the infrastructure for Tools, Resources, dependency injection, and deployment.

This allowed us to focus on solving the hardware integration problem while NitroStack handled the MCP server framework.

Learn more about NitroStack:

https://nitrostack.ai

---

# Team

**Team D4RK NULL**

- Abisher R Nair
- Alwin Varghese
- Gautham Sai
- Gunisha Kaur

---

# License

MIT License

---

## ⭐ If you found this project interesting, consider giving it a star!

Built with ❤️ for the **NitroStack × Amrita University MCP Hackathon**

**OmniMCP — One Interface. Every Machine. Any AI.**
