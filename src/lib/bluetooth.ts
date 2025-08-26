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
  0x1809, // Health Thermometer
  0x181a, // Environmental Sensing
  0x180f, // Battery
  0x180a, // Device Information
  0x180d, // Heart Rate
  0x1822, // Pulse Oximeter
  0x1810, // Blood Pressure
  0x1815, // Automation IO
] as const;

type CharacteristicInfo = {
  name: string;
  unit: string;
  parse: (view: DataView) => number;
};

const UUID = (short: number) => `0000${short.toString(16)}-0000-1000-8000-00805f9b34fb`;

function parseIEEE11073Float(view: DataView, offset = 0): number {
  const m =
    view.getUint8(offset) |
    (view.getUint8(offset + 1) << 8) |
    (view.getUint8(offset + 2) << 16);
  const mantissa = (m & 0x800000) ? m | 0xff000000 : m;
  const exponent = view.getInt8(offset + 3);
  return mantissa * Math.pow(10, exponent);
}

function parseTempMeasurement2A1C(view: DataView): number {
  const flags = view.getUint8(0);
  const value = parseIEEE11073Float(view, 1);
  const isFahrenheit = (flags & 0x01) !== 0;
  return isFahrenheit ? ((value - 32) * 5) / 9 : value;
}

export const CHARACTERISTICS: Record<string, CharacteristicInfo> = {
  [UUID(0x2a6e)]: { name: "temperature", unit: "°C", parse: v => v.getInt16(0, true) / 100 },
  [UUID(0x2a6f)]: { name: "humidity", unit: "%", parse: v => v.getUint16(0, true) / 100 },
  [UUID(0x2a19)]: { name: "battery", unit: "%", parse: v => v.getUint8(0) },
  [UUID(0x2a1c)]: { name: "health_temperature", unit: "°C", parse: parseTempMeasurement2A1C },
};

// Parser helpers for characteristics to convert their DataView into numbers.
export function parseCharacteristicValue(uuid: string, view: DataView): number {
  const parser = CHARACTERISTICS[uuid]?.parse;
  if (parser) {
    return parser(view);
  }
  if (view.byteLength >= 4) return view.getInt32(0, true);
  if (view.byteLength >= 2) return view.getInt16(0, true);
  if (view.byteLength >= 1) return view.getInt8(0);
  return NaN;
}

export function getCharacteristicName(uuid: string): string {
  return CHARACTERISTICS[uuid]?.name ?? uuid;
}

export function getCharacteristicUnit(uuid: string): string {
  return CHARACTERISTICS[uuid]?.unit ?? "";
}
