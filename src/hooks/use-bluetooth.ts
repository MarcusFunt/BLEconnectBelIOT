
"use client";

import { useState, useCallback, useEffect } from 'react';
import type { Device, WidgetDataType } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import {
  parseCharacteristicValue,
  COMPATIBLE_MANUFACTURER_ID,
  COMPATIBLE_MANUFACTURER_DATA_PREFIX,
  KNOWN_SERVICE_UUIDS,
  isCompatibleManufacturerData,
} from "@/lib/bluetooth";
import { loadFromStorage, saveToStorage } from "@/lib/utils";

export function useBluetooth() {
  const [devices, setDevices] = useState<Device[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const restoreDevices = async () => {
      const saved = loadFromStorage<{ id: string; customName?: string }[]>("devices", []);
      if (typeof navigator === "undefined" || !(navigator as any).bluetooth?.getDevices) {
        return;
      }
      try {
        const bleDevices: BluetoothDevice[] = await (navigator as any).bluetooth.getDevices();
        const restored: Device[] = bleDevices.map(d => ({
          id: d.id,
          name: d.name || "Unknown Device",
          rssi: 0,
          connected: d.gatt?.connected ?? false,
          customName: saved.find(s => s.id === d.id)?.customName,
          device: d,
        }));
        setDevices(restored);
      } catch (err) {
        console.warn("Failed to restore devices:", err);
      }
    };
    restoreDevices();
  }, []);

  useEffect(() => {
    const toStore = devices.map(d => ({ id: d.id, customName: d.customName }));
    saveToStorage("devices", toStore);
  }, [devices]);

  const requestDevice = useCallback(async () => {
    try {
      if (typeof navigator === 'undefined' || !(navigator as any).bluetooth) {
        throw new Error('Web Bluetooth API is not available in this browser.');
      }
      
      console.log('Requesting Bluetooth device...');
      const bleDevice = await (navigator as any).bluetooth.requestDevice({
        filters: [
          {
            manufacturerData: [
              {
                companyIdentifier: COMPATIBLE_MANUFACTURER_ID,
                dataPrefix: COMPATIBLE_MANUFACTURER_DATA_PREFIX,
              },
            ],
          },
        ],
        optionalServices: [...KNOWN_SERVICE_UUIDS],
      });

      console.log('Device found:', bleDevice);

      try {
        await bleDevice.watchAdvertisements();
        const isCompatible = await new Promise<boolean>((resolve) => {
          const handler = (event: any) => {
            const data = event.manufacturerData?.get(COMPATIBLE_MANUFACTURER_ID);
            resolve(isCompatibleManufacturerData(data));
            bleDevice.removeEventListener('advertisementreceived', handler);
          };
          bleDevice.addEventListener('advertisementreceived', handler, { once: true });
          setTimeout(() => {
            bleDevice.removeEventListener('advertisementreceived', handler);
            resolve(false);
          }, 1000);
        });

        if (!isCompatible) {
          toast({
            variant: 'destructive',
            title: 'Incompatible Device',
            description: 'Selected device does not match compatibility requirements.',
          });
          return;
        }

        bleDevice.addEventListener('advertisementreceived', (event: any) => {
          if (typeof event.rssi === 'number') {
            setDevices(prev =>
              prev.map(d =>
                d.id === bleDevice.id ? { ...d, rssi: event.rssi } : d
              )
            );
          }
        });
      } catch (err) {
        console.warn('Advertisement watching not supported:', err);
      }

      setDevices(prevDevices => {
        const existingDevice = prevDevices.find(d => d.id === bleDevice.id);
        if (existingDevice) {
          return prevDevices;
        }
        const newDevice: Device = {
          id: bleDevice.id,
          name: bleDevice.name || 'Unknown Device',
          rssi: 0, // Updated via advertisementreceived events when available
          connected: false,
          device: bleDevice,
        };
        return [...prevDevices, newDevice];
      });

      toast({
        title: "Device Found",
        description: `Found "${bleDevice.name || 'Unknown Device'}"`,
      });

    } catch (error: any) {
      console.error('Bluetooth device request failed:', error);
      toast({
        variant: "destructive",
        title: "Scan Error",
        description: error.message || "Could not scan for Bluetooth devices.",
      });
    }
  }, [toast]);

  const connectDevice = useCallback(async (deviceId: string) => {
    const deviceWrapper = devices.find(d => d.id === deviceId);
    if (!deviceWrapper) {
      console.error('Device not found');
      return;
    }

    try {
      console.log(`Connecting to ${deviceWrapper.name}...`);
      const server = await deviceWrapper.device.gatt?.connect();

      const characteristics: Record<string, BluetoothRemoteGATTCharacteristic> = {};
      if (server) {
        try {
          const services = await server.getPrimaryServices();
          for (const service of services) {
            try {
              const chars = await service.getCharacteristics();
              for (const char of chars) {
                characteristics[char.uuid] = char;

                // Auto-subscribe to updates when supported
                const p = (char as any).properties;
                if (p?.notify || p?.indicate) {
                  await char.startNotifications().catch(() => {});
                  char.addEventListener('characteristicvaluechanged', (ev: any) => {
                    const dv = (ev.target as BluetoothRemoteGATTCharacteristic).value as DataView;
                    const val = parseCharacteristicValue(char.uuid, dv);
                    setDevices(prev => prev.map(d =>
                      d.id === deviceId
                        ? { ...d, latestValues: { ...(d.latestValues ?? {}), [char.uuid]: val } }
                        : d
                    ));
                  });
                }
              }
            } catch (_) {
              // Ignore missing characteristics
            }
          }
        } catch (err) {
          console.warn('Service discovery failed:', err);
        }
      }

      setDevices(prev =>
        prev.map(d =>
          d.id === deviceId ? { ...d, connected: true, characteristics, latestValues: {} } : d
        )
      );

      toast({
        title: "Connected",
        description: `Successfully connected to ${deviceWrapper.name}`,
      });

      const handleDisconnected = () => {
        console.log(`${deviceWrapper.name} disconnected.`);
        setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, connected: false } : d));
        toast({
          variant: "destructive",
          title: "Disconnected",
          description: `Lost connection to ${deviceWrapper.name}`,
        });
        deviceWrapper.device.removeEventListener?.('gattserverdisconnected', handleDisconnected);
      };
      deviceWrapper.device.removeEventListener?.('gattserverdisconnected', handleDisconnected);
      deviceWrapper.device.addEventListener?.('gattserverdisconnected', handleDisconnected);

    } catch (error) {
      console.error(`Failed to connect to ${deviceWrapper.name}:`, error);
       toast({
        variant: "destructive",
        title: "Connection Failed",
        description: `Could not connect to ${deviceWrapper.name}`,
      });
    }
  }, [devices, toast]);

  const disconnectDevice = useCallback(async (deviceId: string) => {
    const deviceWrapper = devices.find(d => d.id === deviceId);
    if (!deviceWrapper || !deviceWrapper.device.gatt?.connected) {
      return;
    }

    try {
      console.log(`Disconnecting from ${deviceWrapper.name}...`);
      deviceWrapper.device.gatt?.disconnect();
      setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, connected: false } : d));
      toast({
        title: "Disconnected",
        description: `Disconnected from ${deviceWrapper.name}`,
      });
    } catch (error) {
      console.error(`Failed to disconnect from ${deviceWrapper.name}:`, error);
    }
  }, [devices, toast]);

  const readCharacteristicValue = useCallback(async (
    deviceId: string,
    dataType: WidgetDataType
  ): Promise<number | null> => {
    const deviceWrapper = devices.find(d => d.id === deviceId);
    if (!deviceWrapper) return null;
    const latest = deviceWrapper.latestValues?.[dataType];
    if (latest !== undefined) return latest;
    const characteristic = deviceWrapper.characteristics?.[dataType];
    if (!characteristic) return null;
    try {
      const value = await characteristic.readValue();
      return parseCharacteristicValue(dataType, value);
    } catch (err) {
      console.warn(`Failed to read ${dataType} from ${deviceWrapper?.name}:`, err);
      return null;
    }
  }, [devices]);

  const renameDevice = useCallback((deviceId: string, newName: string) => {
    setDevices(prev =>
      prev.map(d => (d.id === deviceId ? { ...d, customName: newName } : d))
    );
  }, []);

  return {
    devices,
    requestDevice,
    connectDevice,
    disconnectDevice,
    readCharacteristicValue,
    renameDevice,
  };
}
