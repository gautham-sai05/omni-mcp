import { ResourceDecorator as Resource, ExecutionContext, Injectable } from '@nitrostack/core';
import { AdapterManager } from '../adapters/manager.js';

/**
 * MCP Resources for inspecting factory hardware states.
 * Queries AdapterManager to retrieve structured and read-only device/health data.
 */
@Injectable({ deps: [AdapterManager] })
export class HardwareResources {
  constructor(private adapterManager: AdapterManager) {}

  @Resource({
    uri: 'hardware://devices/available',
    name: 'Available Devices',
    description: 'List of all registered hardware devices, including offline/disconnected ones',
    mimeType: 'application/json'
  })
  async getAvailableDevices(uri: string, ctx: ExecutionContext) {
    ctx.logger.info('Fetching available devices resource');
    const adapters = this.adapterManager.listAdapters();
    const devices = adapters.map(adapter => ({
      id: adapter.id,
      name: adapter.name,
      type: adapter.type
    }));

    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify({ devices }, null, 2)
      }]
    };
  }

  @Resource({
    uri: 'hardware://devices/connected',
    name: 'Connected Devices',
    description: 'List of all currently connected/active hardware devices',
    mimeType: 'application/json'
  })
  async getConnectedDevices(uri: string, ctx: ExecutionContext) {
    ctx.logger.info('Fetching connected devices resource');
    const adapters = this.adapterManager.listAdapters();
    const connectedDevices = [];

    for (const adapter of adapters) {
      const status = await adapter.getStatus();
      if (status.connected) {
        connectedDevices.push({
          id: adapter.id,
          name: adapter.name,
          type: adapter.type,
          status
        });
      }
    }

    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify({ connectedDevices }, null, 2)
      }]
    };
  }

  @Resource({
    uri: 'hardware://system/health',
    name: 'System Health',
    description: 'Connection and online status overview of all configured hardware adapters',
    mimeType: 'application/json'
  })
  async getSystemHealth(uri: string, ctx: ExecutionContext) {
    ctx.logger.info('Fetching hardware system health resource');
    const adapters = this.adapterManager.listAdapters();
    const healthSummary: Record<string, any> = {};
    let allHealthy = true;

    for (const adapter of adapters) {
      try {
        const status = await adapter.getStatus();
        healthSummary[adapter.id] = {
          name: adapter.name,
          online: status.online,
          connected: status.connected,
          lastSeen: status.lastSeen
        };
        if (!status.online) {
          allHealthy = false;
        }
      } catch (err: any) {
        allHealthy = false;
        healthSummary[adapter.id] = {
          name: adapter.name,
          online: false,
          connected: false,
          error: err.message
        };
      }
    }

    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify({
          status: allHealthy ? 'HEALTHY' : 'DEGRADED',
          timestamp: new Date().toISOString(),
          devices: healthSummary
        }, null, 2)
      }]
    };
  }
}
