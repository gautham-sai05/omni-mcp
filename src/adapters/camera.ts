import { Injectable } from '@nitrostack/core';
import { createRequire } from 'node:module';
import { HardwareAdapter, AdapterStatus } from './adapter.js';

/**
 * Universal inspection camera adapter supporting laptop webcam and ESP32-CAM.
 */
@Injectable()
export class CameraAdapter implements HardwareAdapter {
  id = 'camera-1';
  name = 'Inspection Camera';
  type = 'camera';

  private readonly esp32CaptureUrl = process.env.ESP32_CAM_CAPTURE_URL ?? 'http://192.168.1.150/capture';
  private readonly requestTimeoutMs = 3500;

  private isConnected = false;
  private resolution = '1920x1080';
  private laptopAvailable = false;
  private esp32CamAvailable = false;
  private activeSource: 'esp32' | 'laptop' | null = null;

  private readonly require = createRequire(import.meta.url);
  private readonly webcamModule = this.require('node-webcam') as {
    list: (callback: (list: string[]) => void) => void;
    create: (options: Record<string, unknown>) => {
      capture: (name: string, callback: (error: Error | null, data: string) => void) => void;
    };
  };

  async connect(): Promise<void> {
    this.esp32CamAvailable = await this.checkEsp32Reachability();
    this.laptopAvailable = await this.detectLaptopWebcam();
    this.isConnected = true;
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    this.activeSource = null;
  }

  async execute(action: string, params?: Record<string, any>): Promise<any> {
    if (!this.isConnected) {
      throw new Error(`Device "${this.id}" is not connected. Call connect() first.`);
    }

    switch (action) {
      case 'capture_image':
      case 'inspection.capture': {
        const sourceParam = params?.source;
        let capture:
          | { imageBase64: string; resolution: string; source: 'esp32' | 'laptop' }
          | null = null;

        if (sourceParam === 'laptop') {
          capture = await this.captureFromLaptop();
        } else if (sourceParam === 'esp32') {
          capture = await this.captureFromEsp32();
        } else {
          let esp32Error: string | null = null;
          try {
            capture = await this.captureFromEsp32();
          } catch (error) {
            esp32Error = error instanceof Error ? error.message : 'Unknown ESP32-CAM error.';
            try {
              capture = await this.captureFromLaptop();
            } catch (laptopError) {
              const laptopMessage = laptopError instanceof Error ? laptopError.message : 'Unknown laptop webcam error.';
              throw new Error(
                `Capture failed for all camera sources. ESP32-CAM error: ${esp32Error} Laptop webcam error: ${laptopMessage}`
              );
            }
          }
        }

        this.activeSource = capture.source;

        return {
          imageBase64: capture.imageBase64,
          mimeType: 'image/jpeg',
          resolution: capture.resolution,
          capturedAt: new Date().toISOString(),
          qualityScore: parseFloat((0.85 + Math.random() * 0.14).toFixed(2)) // simulated inspect quality score
        };
      }
      
      default:
        throw new Error(`Action "${action}" is not supported by Camera Adapter.`);
    }
  }

  async getStatus(): Promise<AdapterStatus> {
    return {
      id: this.id,
      online: true,
      connected: this.isConnected,
      lastSeen: new Date().toISOString(),
      details: {
        resolution: this.resolution,
        sensorType: 'CMOS OV2640',
        fps: 30,
        compressionRatio: '1:15',
        exposureMs: 12.5,
        laptopAvailable: this.laptopAvailable,
        esp32CamAvailable: this.esp32CamAvailable,
        activeSource: this.activeSource
      }
    };
  }

  private async checkEsp32Reachability(): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(this.esp32CaptureUrl);
      return response.ok;
    } catch {
      return false;
    }
  }

  private async detectLaptopWebcam(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        this.webcamModule.list((list) => resolve(Array.isArray(list) && list.length > 0));
      } catch {
        resolve(false);
      }
    });
  }

  private async captureFromEsp32(): Promise<{ imageBase64: string; resolution: string; source: 'esp32' }> {
    try {
      const response = await this.fetchWithTimeout(this.esp32CaptureUrl);
      if (!response.ok) {
        throw new Error(`ESP32-CAM responded with HTTP ${response.status}.`);
      }

      const bytes = await response.arrayBuffer();
      const imageBase64 = Buffer.from(bytes).toString('base64');
      this.esp32CamAvailable = true;

      return {
        imageBase64,
        resolution: this.resolution,
        source: 'esp32'
      };
    } catch (error) {
      this.esp32CamAvailable = false;
      const message = error instanceof Error ? error.message : 'Unknown ESP32-CAM error.';
      throw new Error(`ESP32-CAM capture failed at ${this.esp32CaptureUrl}: ${message}`);
    }
  }

  private async captureFromLaptop(): Promise<{ imageBase64: string; resolution: string; source: 'laptop' }> {
    const webcam = this.webcamModule.create({
      width: 1920,
      height: 1080,
      quality: 100,
      output: 'jpeg',
      callbackReturn: 'base64',
      saveShots: false,
      noBanner: true
    });

    try {
      const imageBase64 = await new Promise<string>((resolve, reject) => {
        webcam.capture('omni_capture', (error: Error | null, data: string) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(data);
        });
      });

      if (!imageBase64) {
        throw new Error('Laptop webcam returned empty image data.');
      }

      this.laptopAvailable = true;

      return {
        imageBase64,
        resolution: this.resolution,
        source: 'laptop'
      };
    } catch (error) {
      this.laptopAvailable = false;
      const message = error instanceof Error ? error.message : 'Unknown laptop webcam error.';
      throw new Error(`Laptop webcam capture failed: ${message}`);
    }
  }

  private async fetchWithTimeout(url: string): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.requestTimeoutMs);

    try {
      return await fetch(url, {
        method: 'GET',
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeout);
    }
  }
}
