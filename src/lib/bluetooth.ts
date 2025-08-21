import type { WidgetDataType } from "./types";

// Manufacturer data used to identify compatible devices during scanning.
export const COMPATIBLE_MANUFACTURER_ID = 0xffff;
// ASCII 'BLE' so custom firmware can advertise it in the manufacturer data payload.
export const COMPATIBLE_MANUFACTURER_DATA_PREFIX = new Uint8Array([0x42, 0x4c, 0x45]);

// Returns true if the provided manufacturer data begins with the expected prefix.
export function isCompatibleManufacturerData(data?: DataView | null): boolean {
  if (!data || data.byteLength < COMPATIBLE_MANUFACTURER_DATA_PREFIX.length) {
    return false;
  }
  for (let i = 0; i < COMPATIBLE_MANUFACTURER_DATA_PREFIX.length; i++) {
    if (data.getUint8(i) !== COMPATIBLE_MANUFACTURER_DATA_PREFIX[i]) {
      return false;
    }
  }
  return true;
}

// Services the app attempts to access when available. These are not used to
// judge device compatibility but enable reading of common characteristics.
export const KNOWN_SERVICE_UUIDS = [
  0x180f, // Battery Service
  0x181a, // Environmental Sensing (Temperature & Humidity)
  0x180d, // Heart Rate Service
  0x1809, // Health Thermometer Service
] as const;

// Mapping of known characteristic UUIDs to their corresponding widget data types.
export const characteristicUUIDToDataType: Record<string, WidgetDataType> = {
  "00002a6e-0000-1000-8000-00805f9b34fb": "temperature", // Temperature (Environmental Sensing)
  "00002a6f-0000-1000-8000-00805f9b34fb": "humidity",    // Humidity (Environmental Sensing)
  "00002a19-0000-1000-8000-00805f9b34fb": "battery",     // Battery Level
  "00002a37-0000-1000-8000-00805f9b34fb": "heart_rate",  // Heart Rate Measurement
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
    case "heart_rate":
      // Flags in first byte: bit0 indicates value format.
      return (view.getUint8(0) & 0x01)
        ? view.getUint16(1, /*littleEndian=*/true)
        : view.getUint8(1);
    default:
      return NaN;
  }
}
