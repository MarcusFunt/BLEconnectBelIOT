
"use client";

import * as React from "react";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { DeviceManager } from "@/components/device-manager";
import { Dashboard } from "@/components/dashboard";
import type { Widget } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Router } from "lucide-react";
import { AddWidgetSheet } from "@/components/add-widget-sheet";
import { useBluetooth } from "@/hooks/use-bluetooth";
import { loadFromStorage, saveToStorage } from "@/lib/utils";

export default function Home() {
    const {
      devices,
      requestDevice,
      connectDevice,
      disconnectDevice,
      renameDevice,
      readCharacteristicValue,
    } = useBluetooth();

  const [widgets, setWidgets] = React.useState<Widget[]>([]);
  const [data, setData] = React.useState<Record<string, Record<string, number>>>({});
  const [isDeviceManagerOpen, setIsDeviceManagerOpen] = React.useState(false);
  const [isAddWidgetSheetOpen, setIsAddWidgetSheetOpen] = React.useState(false);

  const connectedDevices = React.useMemo(() => devices.filter(d => d.connected), [devices]);

  React.useEffect(() => {
    setWidgets(loadFromStorage<Widget[]>("widgets", []));
  }, []);

  React.useEffect(() => {
    saveToStorage("widgets", widgets);
  }, [widgets]);

  React.useEffect(() => {
    connectedDevices.forEach(device => {
      const deviceWidgets = widgets.filter(w => w.deviceId === device.id);
      const values: Record<string, number> = {};
      deviceWidgets.forEach(widget => {
        const latest = device.latestValues?.[widget.dataType];
        if (latest !== undefined) {
          values[widget.dataType] = latest;
        }
      });
      if (Object.keys(values).length) {
        setData(prev => ({
          ...prev,
          [device.id]: { ...(prev[device.id] ?? {}), ...values },
        }));
      }
    });
  }, [connectedDevices, widgets]);

  React.useEffect(() => {
    const intervals: number[] = [];
    widgets.forEach(widget => {
      const device = connectedDevices.find(d => d.id === widget.deviceId);
      if (!device) return;
      const characteristic: any = device.characteristics?.[widget.dataType];
      const props = characteristic?.properties;
      const poll = async () => {
        const value = await readCharacteristicValue(device.id, widget.dataType);
        if (value !== null) {
          setData(prev => ({
            ...prev,
            [device.id]: { ...(prev[device.id] ?? {}), [widget.dataType]: value },
          }));
        }
      };
      if (props?.notify || props?.indicate) {
        poll();
        return;
      }
      poll();
      const id = window.setInterval(poll, widget.settings.refreshRate);
      intervals.push(id);
    });
    return () => intervals.forEach(clearInterval);
  }, [widgets, connectedDevices, readCharacteristicValue]);

  const handleConnectToggle = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    if (device.connected) {
      disconnectDevice(deviceId);
    } else {
      connectDevice(deviceId);
    }
  };

  const handleRenameDevice = (deviceId: string, newName: string) => {
    renameDevice(deviceId, newName);
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
              <Button className="w-full justify-start" onClick={() => setIsAddWidgetSheetOpen(true)}>
                  <Plus className="mr-2" />
                  Add Widget
              </Button>
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
              onScan={requestDevice}
          />
        </DialogContent>
      </Dialog>
       <AddWidgetSheet
          open={isAddWidgetSheetOpen}
          onOpenChange={setIsAddWidgetSheetOpen}
          onAddWidget={handleAddWidget}
          connectedDevices={connectedDevices}
        >
          {null}
        </AddWidgetSheet>
    </SidebarProvider>
  );
}
