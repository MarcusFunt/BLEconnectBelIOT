import type { WidgetDataType } from "./types";

// Manufacturer data used to identify compatible devices during scanning.
export const COMPATIBLE_MANUFACTURER_ID = 0xffff;
// ASCII 'BLE' so custom firmware can advertise it in the manufacturer data payload.
export const COMPATIBLE_MANUFACTURER_DATA_PREFIX = new Uint8Array([0x42, 0x4c, 0x45]);

// Known services used by the application.
// Includes common GATT services so connected devices can expose a wide
// variety of capabilities. Each entry is the 16-bit assigned number for the
// service. Web Bluetooth accepts both strings and numbers for service UUIDs,
// so using the numeric values keeps the list concise while still allowing
// code elsewhere to reference them by name.
export const KNOWN_SERVICE_UUIDS = [
  0x1800, // Generic Access (GAP)
  0x1801, // Generic Attribute (GATT)
  0x1802, // Immediate Alert
  0x1803, // Link Loss
  0x1808, // Glucose
  0x1809, // Health Thermometer
  0x180a, // Device Information
  0x180d, // Heart Rate
  0x180f, // Battery Service
  0x1814, // Running Speed and Cadence
  0x1815, // Automation IO
  0x1816, // Cycling Speed and Cadence
  0x1818, // Cycling Power
  0x181a, // Environmental Sensing
  0x181b, // Body Composition
  0x181c, // User Data
  0x181d, // Weight Scale
  0x181e, // Bond Management
  0x181f, // Continuous Glucose Monitoring
  0x1820, // Internet Protocol Support
  0x1822, // Pulse Oximeter
  0x1826, // Fitness Machine
  0x1829, // Reconnection Configuration
  0x183a, // Insulin Delivery
  0x183b, // Binary Sensor
  0x183c, // Emergency Configuration
  0x183d, // Authorization Control
  0x183e, // Physical Activity Monitor
  0x183f, // Elapsed Time
  0x1840, // Generic Health Sensor
  0x1843, // Audio Input Control
  0x1844, // Volume Control
  0x184d, // Microphone Control
  0x184e, // Audio Stream Control
  0x184f, // Broadcast Audio Scan
  0x1850, // Published Audio Capabilities
  0x1851, // Basic Audio Announcement
  0x1857, // Electronic Shelf Label
  0x185a, // Industrial Measurement Device
  0x185b, // Ranging
  0x185c, // HID ISO
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
