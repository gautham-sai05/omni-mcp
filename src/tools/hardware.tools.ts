import { ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';
import { AdapterManager } from '../adapters/manager.js';

/**
 * MCP Tools for interacting with generic hardware devices.
 * Integrates with the AdapterManager to connect, disconnect, query status, and execute actions.
 */
export class HardwareTools {
  constructor(private adapterManager: AdapterManager) {}

  @Tool({
    name: 'list_devices',
    description: 'List all registered hardware devices and their metadata',
    inputSchema: z.object({})
  })
  async listDevices(input: any, ctx: ExecutionContext) {
    ctx.logger.info('Listing hardware devices');
    const adapters = this.adapterManager.listAdapters();
    
    // Map to simple metadata representation
    const devices = adapters.map(adapter => ({
      id: adapter.id,
      name: adapter.name,
      type: adapter.type
    }));
    
    return { devices };
  }

  @Tool({
    name: 'connect_device',
    description: 'Connect to a specific hardware device by ID',
    inputSchema: z.object({
      deviceId: z.string().describe('The unique identifier of the device to connect')
    })
  })
  async connectDevice(input: { deviceId: string }, ctx: ExecutionContext) {
    ctx.logger.info('Connecting to device', { deviceId: input.deviceId });
    try {
      await this.adapterManager.connect(input.deviceId);
      const status = await this.adapterManager.getStatus(input.deviceId);
      return {
        success: true,
        message: `Successfully connected to device "${input.deviceId}"`,
        status
      };
    } catch (error: any) {
      ctx.logger.error('Failed to connect to device', { deviceId: input.deviceId, error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Tool({
    name: 'disconnect_device',
    description: 'Disconnect from a specific hardware device by ID',
    inputSchema: z.object({
      deviceId: z.string().describe('The unique identifier of the device to disconnect')
    })
  })
  async disconnectDevice(input: { deviceId: string }, ctx: ExecutionContext) {
    ctx.logger.info('Disconnecting from device', { deviceId: input.deviceId });
    try {
      await this.adapterManager.disconnect(input.deviceId);
      const status = await this.adapterManager.getStatus(input.deviceId);
      return {
        success: true,
        message: `Successfully disconnected from device "${input.deviceId}"`,
        status
      };
    } catch (error: any) {
      ctx.logger.error('Failed to disconnect from device', { deviceId: input.deviceId, error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Tool({
    name: 'device_status',
    description: 'Get connection and health status of a specific hardware device',
    inputSchema: z.object({
      deviceId: z.string().describe('The unique identifier of the device')
    })
  })
  async deviceStatus(input: { deviceId: string }, ctx: ExecutionContext) {
    ctx.logger.info('Requesting status for device', { deviceId: input.deviceId });
    try {
      const status = await this.adapterManager.getStatus(input.deviceId);
      return {
        success: true,
        status
      };
    } catch (error: any) {
      ctx.logger.error('Failed to get status for device', { deviceId: input.deviceId, error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Tool({
    name: 'execute_command',
    description: 'Execute an action or command on a specific hardware device',
    inputSchema: z.object({
      deviceId: z.string().describe('The unique identifier of the device'),
      command: z.string().describe('The command/action name to execute (e.g., "read_temp", "set_gpio", "capture_image")'),
      params: z.record(z.any()).optional().describe('Optional parameter payload key-value pairs')
    })
  })
  async executeCommand(input: { deviceId: string; command: string; params?: Record<string, any> }, ctx: ExecutionContext) {
    ctx.logger.info('Executing command on device', { deviceId: input.deviceId, command: input.command, params: input.params });
    try {
      const result = await this.adapterManager.execute(input.deviceId, input.command, input.params);
      return {
        success: true,
        result
      };
    } catch (error: any) {
      ctx.logger.error('Failed to execute command on device', { deviceId: input.deviceId, command: input.command, error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }
}
