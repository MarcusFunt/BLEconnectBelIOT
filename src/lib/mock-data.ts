
import type { Device } from './types';

export const MOCK_DEVICES: Device[] = [
  { id: 'dev-01', name: 'Living Room Sensor', rssi: -45, connected: false },
  { id: 'dev-02', name: 'Bedroom Sensor', rssi: -60, connected: true, customName: "Master Bedroom" },
  { id: 'dev-03', name: 'Kitchen Scale', rssi: -72, connected: false },
  { id: 'dev-04', name: 'Smart Watch', rssi: -55, connected: false },
  { id: 'dev-05', name: 'Garage Thermometer', rssi: -81, connected: true },
];
