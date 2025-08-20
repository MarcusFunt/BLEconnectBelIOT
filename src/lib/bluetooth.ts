import type { WidgetDataType } from "./types";

// Manufacturer data used to identify compatible devices during scanning.
export const COMPATIBLE_MANUFACTURER_ID = 0xffff;
// ASCII 'BLE' so custom firmware can advertise it in the manufacturer data payload.
export const COMPATIBLE_MANUFACTURER_DATA_PREFIX = new Uint8Array([0x42, 0x4c, 0x45]);

// Known services used by the application.
export const KNOWN_SERVICE_UUIDS = [
  'battery_service',
  'health_thermometer',
  'environmental_sensing',
] as const;

// Mapping of known characteristic UUIDs to their corresponding widget data types.
export const characteristicUUIDToDataType: Record<string, WidgetDataType> = {
  "00002a6e-0000-1000-8000-00805f9b34fb": "temperature", // Temperature (Environmental Sensing)
  "00002a6f-0000-1000-8000-00805f9b34fb": "humidity",    // Humidity (Environmental Sensing)
  "00002a19-0000-1000-8000-00805f9b34fb": "battery",     // Battery Level
};

// Reverse mapping to get characteristic UUID from a data type.
export const dataTypeToCharacteristicUUID: Record<WidgetDataType, string> = Object.entries(characteristicUUIDToDataType)
  .reduce((acc, [uuid, type]) => {
    acc[type] = uuid;
    return acc;
  }, {} as Record<WidgetDataType, string>);

// Parser helpers for characteristics to convert their DataView into numbers.
export function parseCharacteristicValue(type: WidgetDataType, view: DataView): number {
  switch (type) {
    case "temperature":
      // Signed 16-bit with a resolution of 0.01 degrees Celsius.
      return view.getInt16(0, /*littleEndian=*/true) / 100;
    case "humidity":
      // Unsigned 16-bit with a resolution of 0.01%.
      return view.getUint16(0, /*littleEndian=*/true) / 100;
    case "battery":
      // Unsigned 8-bit percentage.
      return view.getUint8(0);
    default:
      return NaN;
  }
}
