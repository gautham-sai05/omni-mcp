import { Module } from '@nitrostack/core';
import { HardwareTools } from './hardware.tools.js';
import { HardwareResources } from './hardware.resources.js';
import { HardwarePrompts } from './hardware.prompts.js';
import { AdapterManager } from '../adapters/manager.js';
import { Esp32Adapter } from '../adapters/esp32.js';
import { CameraAdapter } from '../adapters/camera.js';

/**
 * Module wrapping all hardware-related controllers and providers.
 * Ready to be imported by the root AppModule.
 */
@Module({
  name: 'hardware',
  description: 'Module for managing factory hardware and capabilities',
  controllers: [HardwareTools, HardwareResources, HardwarePrompts],
  providers: [AdapterManager, Esp32Adapter, CameraAdapter],
  exports: [AdapterManager]
})
export class HardwareModule {}
