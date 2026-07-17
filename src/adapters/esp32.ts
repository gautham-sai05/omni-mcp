import { Injectable } from '@nitrostack/core';
import { HardwareAdapter, AdapterStatus } from './adapter.js';

/**
 * Mock implementation of the ESP32 Machine Controller.
 * Ready for Member 2 to integrate with real hardware HTTP endpoints.
 */
@Injectable()
export class Esp32Adapter implements HardwareAdapter {
  id = 'esp32-1';
  name = 'Machine Controller (ESP32)';
  type = 'esp32';
  
  private isConnected = false;
  private ipAddress = '192.168.1.50';

  async connect(): Promise<void> {
    // Simulate slight network latency
    await new Promise((resolve) => setTimeout(resolve, 100));
    this.isConnected = true;
  }

  async disconnect(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    this.isConnected = false;
  }

  async execute(action: string, params?: Record<string, any>): Promise<any> {
    if (!this.isConnected) {
      throw new Error(`Device "${this.id}" is not connected. Call connect() first.`);
    }

    switch (action) {
      case 'read_temp':
      case 'machine.temperature': {
        // Return a realistic factory temperature fluctuating around 32-38 degrees Celsius
        const baseTemp = 34.2;
        const fluctuation = (Math.random() - 0.5) * 3;
        const temperature = parseFloat((baseTemp + fluctuation).toFixed(2));
        return {
          temperature,
          unit: 'C',
          timestamp: new Date().toISOString()
        };
      }
      
      case 'set_gpio':
      case 'conveyor.output': {
        const pin = params?.pin ?? 2;
        const value = params?.value ?? 0;
        return {
          ok: true,
          pin,
          value,
          state: value === 1 ? 'ON' : 'OFF',
          timestamp: new Date().toISOString()
        };
      }
      
      default:
        throw new Error(`Action "${action}" is not supported by ESP32 Adapter.`);
    }
  }

  async getStatus(): Promise<AdapterStatus> {
    return {
      id: this.id,
      online: true, // Device is reachable on local network
      connected: this.isConnected,
      lastSeen: new Date().toISOString(),
      details: {
        firmware: 'v1.0.8-stable',
        signalStrength: '-64dBm',
        ipAddress: this.ipAddress,
        heapFreeBytes: 182400
      }
    };
  }
}
