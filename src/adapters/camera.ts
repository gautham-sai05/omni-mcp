import { Injectable } from '@nitrostack/core';
import { HardwareAdapter, AdapterStatus } from './adapter.js';

/**
 * Mock implementation of the Inspection Camera Adapter.
 * Ready for Member 3 to integrate with real USB/IP cameras (node-webcam, ffmpeg, or HTTP frame pull).
 */
@Injectable()
export class CameraAdapter implements HardwareAdapter {
  id = 'camera-1';
  name = 'Inspection Camera';
  type = 'camera';
  
  private isConnected = false;
  private resolution = '1920x1080';

  async connect(): Promise<void> {
    // Simulate camera optical calibration latency
    await new Promise((resolve) => setTimeout(resolve, 200));
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
      case 'capture_image':
      case 'inspection.capture': {
        // A valid 1x1 pixel black JPEG base64 string to prevent frontend rendering crashes
        const mockImageBase64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
        
        return {
          imageBase64: mockImageBase64,
          mimeType: 'image/jpeg',
          resolution: this.resolution,
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
      online: true, // Camera is responding on interface
      connected: this.isConnected,
      lastSeen: new Date().toISOString(),
      details: {
        resolution: this.resolution,
        sensorType: 'CMOS OV2640',
        fps: 30,
        compressionRatio: '1:15',
        exposureMs: 12.5
      }
    };
  }
}
