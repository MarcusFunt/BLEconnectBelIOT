
"use client";

import * as React from "react";
import { Plus, Router } from "lucide-react";
import { Widget } from "@/components/widget";
import { Button } from "@/components/ui/button";
import { AddWidgetSheet } from "@/components/add-widget-sheet";
import type { Device, Widget as WidgetType } from "@/lib/types";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface DashboardProps {
  widgets: WidgetType[];
  devices: Device[];
  data: Record<string, Record<string, number>>;
  onAddWidget: (widget: Omit<WidgetType, 'id'>) => void;
  onRemoveWidget: (widgetId: string) => void;
  connectedDevices: Device[];
  onOpenDeviceManager: () => void;
}

export function Dashboard({ widgets, devices, data, onAddWidget, onRemoveWidget, connectedDevices, onOpenDeviceManager }: DashboardProps) {
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const getDeviceName = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    return device?.customName || device?.name || 'Unknown Device';
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between p-4 border-b shrink-0">
        <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden"/>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onOpenDeviceManager}>
            <Router className="mr-2" />
            Device Manager
          </Button>
          <AddWidgetSheet
            open={isSheetOpen}
            onOpenChange={setIsSheetOpen}
            onAddWidget={(widget) => {
              onAddWidget(widget);
              setIsSheetOpen(false);
            }}
            connectedDevices={connectedDevices}
          >
            <Button>
              <Plus className="mr-2" />
              Add Widget
            </Button>
          </AddWidgetSheet>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-4 md:p-6">
        {widgets.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <h2 className="text-2xl font-semibold">No widgets yet</h2>
              <p className="mt-2 text-muted-foreground">
                Click "Add Widget" to start visualizing your data.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {widgets.map(widget => (
              <Widget
                key={widget.id}
                widget={widget}
                data={data[widget.deviceId]?.[widget.dataType]}
                deviceName={getDeviceName(widget.deviceId)}
                onRemove={onRemoveWidget}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
