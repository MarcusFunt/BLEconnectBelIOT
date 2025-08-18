
"use client";

import * as React from "react";
import { Widget } from "@/components/widget";
import type { Device, Widget as WidgetType } from "@/lib/types";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { BelIotLogo } from "@/components/icons";

interface DashboardProps {
  widgets: WidgetType[];
  devices: Device[];
  data: Record<string, Record<string, number>>;
  onRemoveWidget: (widgetId: string) => void;
}

export function Dashboard({ widgets, devices, data, onRemoveWidget }: DashboardProps) {

  const getDeviceName = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    return device?.customName || device?.name || 'Unknown Device';
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between p-4 border-b shrink-0 md:justify-start md:gap-4">
        <SidebarTrigger/>
        <div className="flex items-center gap-2">
          <BelIotLogo className="w-6 h-6 text-primary md:hidden" />
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-4 md:p-6">
        {widgets.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <h2 className="text-2xl font-semibold">No widgets yet</h2>
              <p className="mt-2 text-muted-foreground">
                Open the menu to add your first widget.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
