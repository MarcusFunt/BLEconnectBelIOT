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
] as const;

interface CharacteristicInfo {
  name: string;
  unit: string;
  parse: (view: DataView) => number;
}

export const CHARACTERISTICS: Record<string, CharacteristicInfo> = {
  "00002a6e-0000-1000-8000-00805f9b34fb": {
    name: "temperature",
    unit: "°C",
    parse: view => view.getInt16(0, true) / 100,
  },
  "00002a6f-0000-1000-8000-00805f9b34fb": {
    name: "humidity",
    unit: "%",
    parse: view => view.getUint16(0, true) / 100,
  },
  "00002a19-0000-1000-8000-00805f9b34fb": {
    name: "battery",
    unit: "%",
    parse: view => view.getUint8(0),
  },
};

// Parser helpers for characteristics to convert their DataView into numbers.
export function parseCharacteristicValue(uuid: string, view: DataView): number {
  const parser = CHARACTERISTICS[uuid]?.parse;
  if (parser) {
    return parser(view);
  }
  if (view.byteLength >= 2) {
    return view.getInt16(0, true);
  }
  if (view.byteLength >= 1) {
    return view.getInt8(0);
  }
  return NaN;
}

export function getCharacteristicName(uuid: string): string {
  return CHARACTERISTICS[uuid]?.name ?? uuid;
}

export function getCharacteristicUnit(uuid: string): string {
  return CHARACTERISTICS[uuid]?.unit ?? "";
}
