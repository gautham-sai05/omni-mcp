import { AdapterManager } from './adapters/manager.js';
import { Esp32Adapter } from './adapters/esp32.js';
import { CameraAdapter } from './adapters/camera.js';

/**
 * Verification script for OmniMCP adapters and manager.
 */
async function runVerification() {
  console.log('Starting OmniMCP Adapter Verification...\n');

  // 1. Instantiate adapters and manager (simulate DI container)
  const esp32 = new Esp32Adapter();
  const camera = new CameraAdapter();
  const manager = new AdapterManager(esp32, camera);
  
  // 2. Trigger lifecycle hook
  console.log('Triggering onModuleInit lifecycle hook...');
  await manager.onModuleInit();
  console.log('✓ Hook completed.\n');
  
  // 3. Test list_devices
  console.log('=== TEST: listAdapters() ===');
  const list = manager.listAdapters();
  console.log(`Registered adapters count: ${list.length}`);
  list.forEach(a => console.log(` - ID: ${a.id} | Name: ${a.name} | Type: ${a.type}`));
  if (list.length === 2) {
    console.log('✓ listAdapters() returned both adapters.\n');
  } else {
    throw new Error('Verification failed: listAdapters did not return both adapters.');
  }
  
  // 4. Test status before connection
  console.log('=== TEST: getStatus() (Before Connection) ===');
  const statusEsp1 = await manager.getStatus('esp32-1');
  const statusCam1 = await manager.getStatus('camera-1');
  console.log(` - ESP32 Connected: ${statusEsp1.connected}`);
  console.log(` - Camera Connected: ${statusCam1.connected}`);
  if (!statusEsp1.connected && !statusCam1.connected) {
    console.log('✓ Devices correctly show connected = false.\n');
  } else {
    throw new Error('Verification failed: Devices should not show connected yet.');
  }
  
  // 5. Test connect
  console.log('=== TEST: connect() ===');
  console.log('Connecting ESP32...');
  await manager.connect('esp32-1');
  console.log('Connecting Camera...');
  await manager.connect('camera-1');
  
  const statusEsp2 = await manager.getStatus('esp32-1');
  const statusCam2 = await manager.getStatus('camera-1');
  console.log(` - ESP32 Connected: ${statusEsp2.connected}`);
  console.log(` - Camera Connected: ${statusCam2.connected}`);
  if (statusEsp2.connected && statusCam2.connected) {
    console.log('✓ Devices successfully connected.\n');
  } else {
    throw new Error('Verification failed: Devices failed to connect.');
  }
  
  // 6. Test execute
  console.log('=== TEST: execute() ===');
  
  console.log('Executing read_temp on ESP32...');
  const tempResult = await manager.execute('esp32-1', 'read_temp');
  console.log(' - Response:', tempResult);
  
  console.log('Executing set_gpio on ESP32...');
  const gpioResult = await manager.execute('esp32-1', 'set_gpio', { pin: 4, value: 1 });
  console.log(' - Response:', gpioResult);
  
  console.log('Executing capture_image on Camera...');
  const imgResult = await manager.execute('camera-1', 'capture_image');
  console.log(' - Response:', { ...imgResult, imageBase64: `${imgResult.imageBase64.substring(0, 15)}...` });
  
  if (tempResult.temperature && gpioResult.ok && imgResult.imageBase64) {
    console.log('✓ All execute command mock responses are valid.\n');
  } else {
    throw new Error('Verification failed: Command execution returned invalid outputs.');
  }

  // 7. Test disconnect
  console.log('=== TEST: disconnect() ===');
  await manager.disconnect('esp32-1');
  await manager.disconnect('camera-1');
  const statusEsp3 = await manager.getStatus('esp32-1');
  const statusCam3 = await manager.getStatus('camera-1');
  if (!statusEsp3.connected && !statusCam3.connected) {
    console.log('✓ Devices successfully disconnected.\n');
  } else {
    throw new Error('Verification failed: Devices failed to disconnect.');
  }

  console.log('OmniMCP Adapter Verification Successful! All checks passed.');
}

runVerification().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
