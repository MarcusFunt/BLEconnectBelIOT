
export type WidgetDataType = string;

export type Device = {
  id: string;
  name: string;
  rssi: number;
  connected: boolean;
  customName?: string;
  device: BluetoothDevice;
  /**
   * Map of supported characteristic UUIDs keyed by their UUID.
   * Populated when a device is connected and its services are discovered.
   */
  characteristics?: Record<string, BluetoothRemoteGATTCharacteristic>;
};

export type WidgetType = 'value' | 'gauge' | 'graph';

export type Widget = {
  id: string;
  title: string;
  deviceId: string;
  dataType: WidgetDataType;
  type: WidgetType;
};
