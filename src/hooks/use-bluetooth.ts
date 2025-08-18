
"use client";

import { useState, useCallback } from 'react';
import type { Device } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

export function useBluetooth() {
  const [devices, setDevices] = useState<Device[]>([]);
  const { toast } = useToast();

  const requestDevice = useCallback(async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.bluetooth) {
        throw new Error('Web Bluetooth API is not available in this browser.');
      }
      
      console.log('Requesting Bluetooth device...');
      const bleDevice = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'health_thermometer', 'environmental_sensing'],
      });
      
      console.log('Device found:', bleDevice);

      setDevices(prevDevices => {
        const existingDevice = prevDevices.find(d => d.id === bleDevice.id);
        if (existingDevice) {
          return prevDevices;
        }
        const newDevice: Device = {
          id: bleDevice.id,
          name: bleDevice.name || 'Unknown Device',
          rssi: 0, // RSSI is not available from requestDevice, would need active scanning
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
      await deviceWrapper.device.gatt?.connect();
      
      setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, connected: true } : d));
      
      toast({
        title: "Connected",
        description: `Successfully connected to ${deviceWrapper.name}`,
      });

      deviceWrapper.device.addEventListener('gattserverdisconnected', () => {
        console.log(`${deviceWrapper.name} disconnected.`);
        setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, connected: false } : d));
         toast({
            variant: "destructive",
            title: "Disconnected",
            description: `Lost connection to ${deviceWrapper.name}`,
        });
      });

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

  return {
    devices,
    requestDevice,
    connectDevice,
    disconnectDevice,
  };
}
