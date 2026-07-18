import { Injectable } from '@nitrostack/core';
import { HardwareAdapter, AdapterStatus } from './adapter.js';

@Injectable()
export class Esp32Adapter implements HardwareAdapter {
  id = 'esp32-1';
  name = 'Machine Controller (ESP32)';
  type = 'esp32';

  private isConnected = false;
  private ipAddress = process.env.ESP32_IP || '10.86.107.92';
  private baseUrl = `http://${this.ipAddress}`;

  async connect(): Promise<void> {
    try {
      const res = await fetch(`${this.baseUrl}/status`, {
        signal: AbortSignal.timeout(3000),
      });

      if (!res.ok) {
        throw new Error('ESP32 not responding');
      }

      this.isConnected = true;
    } catch (err) {
      this.isConnected = false;
      throw new Error(
        `Failed to connect to ESP32 at ${this.ipAddress}: ${
          (err as Error).message
        }`
      );
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
  }

  async execute(
    action: string,
    params?: Record<string, any>
  ): Promise<any> {
    if (!this.isConnected) {
      throw new Error(`Device "${this.id}" is not connected.`);
    }

    switch (action) {
      case 'read_temp':
      case 'machine.temperature': {
        const res = await fetch(`${this.baseUrl}/temp`, {
          signal: AbortSignal.timeout(3000),
        });

        const data = (await res.json()) as any;

        return {
          temperature: data.temperature,
          unit: 'C',
          timestamp: new Date().toISOString(),
        };
      }

      case 'set_gpio':
      case 'conveyor.output': {
        const pin = params?.pin ?? 25;
        const value = params?.value ?? 0;

        const res = await fetch(
          `${this.baseUrl}/gpio?pin=${pin}&value=${value}`,
          {
            signal: AbortSignal.timeout(3000),
          }
        );

        const data = (await res.json()) as any;

        return {
          ok: data.success ?? data.ok,
          pin,
          value,
          state: value === 1 ? 'ON' : 'OFF',
          timestamp: new Date().toISOString(),
        };
      }

      default:
        throw new Error(`Action "${action}" not supported.`);
    }
  }

  async getStatus(): Promise<AdapterStatus> {
    try {
      const res = await fetch(`${this.baseUrl}/status`, {
        signal: AbortSignal.timeout(2000),
      });

      const data = (await res.json()) as any;

      return {
        id: this.id,
        online: true,
        connected: this.isConnected,
        lastSeen: new Date().toISOString(),
        details: {
          ipAddress: this.ipAddress,
          temperature: data.temperature,
          led: data.led,
          color: data.color,
        },
      };
    } catch {
      return {
        id: this.id,
        online: false,
        connected: false,
        lastSeen: new Date().toISOString(),
        details: {
          ipAddress: this.ipAddress,
        },
      };
    }
  }
}
