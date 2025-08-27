
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
  /**
   * Latest numeric values for characteristics keyed by UUID.
   * Populated via notifications/indications when available.
   */
  latestValues?: Record<string, number>;
};

export type WidgetType = 'value' | 'gauge' | 'graph';

export type WidgetLogEntry = {
  time: number;
  value: number;
};

export type Widget = {
  id: string;
  title: string;
  deviceId: string;
  dataType: WidgetDataType;
  type: WidgetType;
  settings: {
    historyLength: number;
    lineColor: string;
    refreshRate: number;
  };
  /**
   * Optional log buffer storing all readings for export.
   */
  log?: WidgetLogEntry[];
};
