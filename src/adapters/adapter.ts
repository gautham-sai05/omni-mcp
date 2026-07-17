export interface AdapterStatus {
  id: string;
  online: boolean;
  connected: boolean;
  lastSeen: string;
  details?: Record<string, any>;
}

/**
 * Generic interface that all hardware adapters must implement.
 * Ensures strict typing and modularity.
 */
export interface HardwareAdapter {
  /** Unique identifier for the hardware device/adapter */
  id: string;
  
  /** Human-readable name for the device */
  name: string;
  
  /** Type of hardware (e.g., "esp32", "camera") */
  type: string;

  /** Establishes a connection to the hardware device */
  connect(): Promise<void>;

  /** Terminates the connection to the hardware device */
  disconnect(): Promise<void>;

  /**
   * Executes a command/action on the hardware device
   * @param action The specific action to trigger (e.g., "read_temp", "set_gpio")
   * @param params Optional parameters for the action
   */
  execute(action: string, params?: Record<string, any>): Promise<any>;

  /** Retrieves the current status of the hardware device */
  getStatus(): Promise<AdapterStatus>;
}
