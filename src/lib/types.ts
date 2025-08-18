
export type Device = {
  id: string;
  name: string;
  rssi: number;
  connected: boolean;
  customName?: string;
  device: BluetoothDevice;
};

export type WidgetType = 'value' | 'gauge';

export const widgetDataTypes = ["temperature", "humidity", "battery"] as const;
export type WidgetDataType = (typeof widgetDataTypes)[number];


export type Widget = {
  id: string;
  title: string;
  deviceId: string;
  dataType: WidgetDataType;
  type: WidgetType;
};
