
"use client";

import * as React from "react";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { DeviceManager } from "@/components/device-manager";
import { Dashboard } from "@/components/dashboard";
import type { Device, Widget } from "@/lib/types";
import { MOCK_DEVICES } from "@/lib/mock-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Router } from "lucide-react";
import { AddWidgetSheet } from "@/components/add-widget-sheet";

export default function Home() {
  const [devices, setDevices] = React.useState<Device[]>(MOCK_DEVICES);
  const [widgets, setWidgets] = React.useState<Widget[]>([]);
  const [data, setData] = React.useState<Record<string, Record<string, number>>>({});
  const [isDeviceManagerOpen, setIsDeviceManagerOpen] = React.useState(false);
  const [isAddWidgetSheetOpen, setIsAddWidgetSheetOpen] = React.useState(false);

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
    setIsAddWidgetSheetOpen(false);
  };

  const handleRemoveWidget = (widgetId: string) => {
    setWidgets(prevWidgets => prevWidgets.filter(widget => widget.id !== widgetId));
  };

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="offcanvas" className="bg-sidebar">
          <div className="flex-1 p-4 space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => setIsDeviceManagerOpen(true)}>
              <Router className="mr-2" />
              Device Manager
              </Button>
              <AddWidgetSheet
                open={isAddWidgetSheetOpen}
                onOpenChange={setIsAddWidgetSheetOpen}
                onAddWidget={handleAddWidget}
                connectedDevices={connectedDevices}
              >
                <Button className="w-full justify-start" onClick={() => setIsAddWidgetSheetOpen(true)}>
                    <Plus className="mr-2" />
                    Add Widget
                </Button>
              </AddWidgetSheet>
          </div>
      </Sidebar>
      <SidebarInset>
        <Dashboard
            widgets={widgets}
            devices={devices}
            data={data}
            onRemoveWidget={handleRemoveWidget}
        />
      </SidebarInset>
      <Dialog open={isDeviceManagerOpen} onOpenChange={setIsDeviceManagerOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Device Manager</DialogTitle>
          </DialogHeader>
          <DeviceManager 
              devices={devices} 
              onConnectToggle={handleConnectToggle} 
              onRenameDevice={handleRenameDevice} 
          />
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
