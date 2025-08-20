
export const widgetDataTypes = ["temperature", "humidity", "battery"] as const;
export type WidgetDataType = (typeof widgetDataTypes)[number];

export type Device = {
  id: string;
  name: string;
  rssi: number;
  connected: boolean;
  customName?: string;
  device: BluetoothDevice;
  /**
   * Map of supported characteristic UUIDs keyed by their associated widget data type.
   * Populated when a device is connected and its services are discovered.
   */
  characteristics?: Partial<Record<WidgetDataType, BluetoothRemoteGATTCharacteristic>>;
};

export type WidgetType = 'value' | 'gauge';

export type Widget = {
  id: string;
  title: string;
  deviceId: string;
  dataType: WidgetDataType;
  type: WidgetType;
};
