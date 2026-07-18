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

  private get isSimulationMode(): boolean {
    return process.env.SIMULATION_MODE === 'true';
  }

  async connect(): Promise<void> {
    if (this.isSimulationMode) {
      this.isConnected = true;
      return;
    }

    try {
      const res = await fetch(`${this.baseUrl}/status`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error('ESP32 not responding');
      this.isConnected = true;
    } catch (err) {
      this.isConnected = false;
      throw new Error(`Failed to connect to ESP32 at ${this.ipAddress}: ${(err as Error).message}`);
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
  }

  async execute(action: string, params?: Record<string, any>): Promise<any> {
    if (!this.isConnected) throw new Error(`Device "${this.id}" is not connected.`);

    // GPIO bounds checking & validation
    const pin = params?.pin ?? 25;
    const value = params?.value ?? 0;

    if (action === 'set_gpio' || action === 'conveyor.output') {
      if (typeof pin !== 'number' || pin < 0 || pin > 40) {
        throw new Error(`Invalid GPIO pin: ${pin}. Pin must be between 0 and 40.`);
      }
      if (value !== 0 && value !== 1) {
        throw new Error(`Invalid GPIO value: ${value}. Value must be 0 (OFF) or 1 (ON).`);
      }
    }

    if (this.isSimulationMode) {
      switch (action) {
        case 'read_temp':
        case 'machine.temperature': {
          const simulatedTemp = parseFloat((24.5 + Math.sin(Date.now() / 10000) * 2).toFixed(2));
          return { temperature: simulatedTemp, unit: 'C', timestamp: new Date().toISOString(), simulated: true };
        }
        case 'set_gpio':
        case 'conveyor.output': {
          return { ok: true, pin, value, state: value === 1 ? 'ON' : 'OFF', timestamp: new Date().toISOString(), simulated: true };
        }
        default:
          throw new Error(`Action "${action}" not supported.`);
      }
    }

    switch (action) {
      case 'read_temp':
      case 'machine.temperature': {
        const res = await fetch(`${this.baseUrl}/temp`, { signal: AbortSignal.timeout(3000) });
        const data = (await res.json()) as any;
        return { temperature: data.temperature, unit: 'C', timestamp: new Date().toISOString() };
      }
      case 'set_gpio':
      case 'conveyor.output': {
        const res = await fetch(`${this.baseUrl}/gpio?pin=${pin}&value=${value}`, { signal: AbortSignal.timeout(3000) });
        const data = (await res.json()) as any;
        return { ok: data.success ?? data.ok, pin, value, state: value === 1 ? 'ON' : 'OFF', timestamp: new Date().toISOString() };
      }
      default:
        throw new Error(`Action "${action}" not supported.`);
    }
  }

  async getStatus(): Promise<AdapterStatus> {
    if (this.isSimulationMode) {
      const simulatedTemp = parseFloat((24.5 + Math.sin(Date.now() / 10000) * 2).toFixed(2));
      return {
        id: this.id,
        online: true,
        connected: this.isConnected,
        lastSeen: new Date().toISOString(),
        details: {
          ipAddress: `${this.ipAddress} (Simulated)`,
          temperature: simulatedTemp,
          led: 1,
          color: 'green',
          simulated: true
        },
      };
    }

    try {
      const res = await fetch(`${this.baseUrl}/status`, { signal: AbortSignal.timeout(2000) });
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
        details: { ipAddress: this.ipAddress },
      };
    }
  }
}

