
"use client";

import * as React from "react";
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { DeviceManager } from "@/components/device-manager";
import { Dashboard } from "@/components/dashboard";
import type { Device, Widget } from "@/lib/types";
import { MOCK_DEVICES } from "@/lib/mock-data";
import { BelIotLogo } from "@/components/icons";

export default function Home() {
  const [devices, setDevices] = React.useState<Device[]>(MOCK_DEVICES);
  const [widgets, setWidgets] = React.useState<Widget[]>([]);
  const [data, setData] = React.useState<Record<string, Record<string, number>>>({});

  const connectedDevices = React.useMemo(() => devices.filter(d => d.connected), [devices]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setData(currentData => {
        const newData = { ...currentData };
        devices.forEach(device => {
          if (device.connected) {
            if (!newData[device.id]) newData[device.id] = {};
            
            const tempChange = (Math.random() - 0.5) * 0.5;
            const humidChange = (Math.random() - 0.5) * 1;
            const batteryDrain = Math.random() * 0.05;

            const currentTemp = newData[device.id].temperature || 21;
            const currentHumid = newData[device.id].humidity || 55;
            const currentBattery = newData[device.id].battery ?? 100;

            newData[device.id].temperature = Math.round((currentTemp + tempChange) * 10) / 10;
            newData[device.id].humidity = Math.max(0, Math.min(100, Math.round((currentHumid + humidChange) * 10) / 10));
            newData[device.id].battery = Math.max(0, currentBattery - batteryDrain);
          }
        });
        return newData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [devices]);

  const handleConnectToggle = (deviceId: string) => {
    setDevices(prevDevices =>
      prevDevices.map(device =>
        device.id === deviceId ? { ...device, connected: !device.connected } : device
      )
    );
  };

  const handleRenameDevice = (deviceId: string, newName: string) => {
    setDevices(prevDevices =>
      prevDevices.map(device =>
        device.id === deviceId ? { ...device, customName: newName } : device
      )
    );
  };

  const handleAddWidget = (widget: Omit<Widget, 'id'>) => {
    setWidgets(prevWidgets => [...prevWidgets, { ...widget, id: `widget-${Date.now()}` }]);
  };

  const handleRemoveWidget = (widgetId: string) => {
    setWidgets(prevWidgets => prevWidgets.filter(widget => widget.id !== widgetId));
  };

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon" className="bg-sidebar">
        <div className="flex flex-col h-full">
            <div className="p-4 flex items-center gap-2">
                <BelIotLogo className="w-8 h-8 text-primary" />
                <h1 className="text-xl font-bold group-data-[collapsible=icon]:hidden">belIOT</h1>
            </div>
            <DeviceManager 
                devices={devices} 
                onConnectToggle={handleConnectToggle} 
                onRenameDevice={handleRenameDevice} 
            />
        </div>
      </Sidebar>
      <SidebarInset>
        <Dashboard
            widgets={widgets}
            devices={devices}
            data={data}
            onAddWidget={handleAddWidget}
            onRemoveWidget={handleRemoveWidget}
            connectedDevices={connectedDevices}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
