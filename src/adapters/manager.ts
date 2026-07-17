import { Injectable, OnModuleInit } from '@nitrostack/core';
import { HardwareAdapter, AdapterStatus } from './adapter.js';
import { Esp32Adapter } from './esp32.js';
import { CameraAdapter } from './camera.js';

/**
 * Manages the lifecycle and execution of all registered hardware adapters.
 * Implements clean registry pattern.
 */
@Injectable({ deps: [Esp32Adapter, CameraAdapter] })
export class AdapterManager implements OnModuleInit {
  private adapters = new Map<string, HardwareAdapter>();

  constructor(
    private esp32Adapter: Esp32Adapter,
    private cameraAdapter: CameraAdapter
  ) {}

  /**
   * Registers all injected adapters when the module initializes.
   */
  async onModuleInit(): Promise<void> {
    this.registerAdapter(this.esp32Adapter);
    this.registerAdapter(this.cameraAdapter);
  }

  /**
   * Registers a new hardware adapter
   * @param adapter The HardwareAdapter instance to register
   */
  registerAdapter(adapter: HardwareAdapter): void {
    if (!adapter.id) {
      throw new Error('Adapter ID is required.');
    }
    if (this.adapters.has(adapter.id)) {
      throw new Error(`Adapter with ID "${adapter.id}" is already registered.`);
    }
    this.adapters.set(adapter.id, adapter);
  }

  /**
   * Unregisters a hardware adapter by ID
   * @param id Unique identifier of the adapter to remove
   */
  unregisterAdapter(id: string): void {
    if (!this.adapters.has(id)) {
      throw new Error(`Adapter with ID "${id}" is not registered.`);
    }
    this.adapters.delete(id);
  }

  /**
   * Retrieves a registered adapter by ID
   * @param id Unique identifier of the adapter
   */
  getAdapter(id: string): HardwareAdapter | undefined {
    return this.adapters.get(id);
  }

  /**
   * Returns a list of all registered hardware adapters
   */
  listAdapters(): HardwareAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Triggers the connection sequence for a specific adapter
   * @param id Unique identifier of the adapter
   */
  async connect(id: string): Promise<void> {
    const adapter = this.getRequiredAdapter(id);
    await adapter.connect();
  }

  /**
   * Triggers the disconnection sequence for a specific adapter
   * @param id Unique identifier of the adapter
   */
  async disconnect(id: string): Promise<void> {
    const adapter = this.getRequiredAdapter(id);
    await adapter.disconnect();
  }

  /**
   * Executes a command on a specific adapter
   * @param id Unique identifier of the adapter
   * @param action Command name to execute
   * @param params Optional arguments for the command
   */
  async execute(id: string, action: string, params?: Record<string, any>): Promise<any> {
    const adapter = this.getRequiredAdapter(id);
    return await adapter.execute(action, params);
  }

  /**
   * Retrieves the current status of a specific adapter
   * @param id Unique identifier of the adapter
   */
  async getStatus(id: string): Promise<AdapterStatus> {
    const adapter = this.getRequiredAdapter(id);
    return await adapter.getStatus();
  }

  /**
   * Helper method to retrieve an adapter or throw if not found
   * @private
   */
  private getRequiredAdapter(id: string): HardwareAdapter {
    const adapter = this.adapters.get(id);
    if (!adapter) {
      throw new Error(`Adapter with ID "${id}" is not registered.`);
    }
    return adapter;
  }
}
