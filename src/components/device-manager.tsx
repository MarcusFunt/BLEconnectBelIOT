
"use client";

import * as React from "react";
import type { Device } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bluetooth, BluetoothConnected, Edit, Check, X, Signal, Rss } from "lucide-react";

interface DeviceManagerProps {
  devices: Device[];
  onConnectToggle: (deviceId: string) => void;
  onRenameDevice: (deviceId: string, newName: string) => void;
}

export function DeviceManager({ devices, onConnectToggle, onRenameDevice }: DeviceManagerProps) {
  const [editingDeviceId, setEditingDeviceId] = React.useState<string | null>(null);
  const [tempName, setTempName] = React.useState("");

  const handleEditStart = (device: Device) => {
    setEditingDeviceId(device.id);
    setTempName(device.customName || device.name);
  };

  const handleEditCancel = () => {
    setEditingDeviceId(null);
    setTempName("");
  };

  const handleEditSave = () => {
    if (editingDeviceId) {
      onRenameDevice(editingDeviceId, tempName);
    }
    setEditingDeviceId(null);
    setTempName("");
  };

  const getRssiIcon = (rssi: number) => {
    if (rssi > -60) return <Signal className="w-4 h-4 text-green-500" />;
    if (rssi > -80) return <Signal className="w-4 h-4 text-yellow-500" />;
    return <Rss className="w-4 h-4 text-red-500" />;
  }

  return (
    <ScrollArea className="flex-1 p-2">
      <div className="space-y-2 group-data-[collapsible=icon]:px-0 px-2">
          <h2 className="text-sm font-semibold text-muted-foreground group-data-[collapsible=icon]:text-center">Devices</h2>
          <ul className="space-y-2">
            {devices.map(device => (
              <li key={device.id} className="p-2 rounded-md hover:bg-sidebar-accent">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {device.connected ? 
                            <BluetoothConnected className="w-5 h-5 text-primary" /> : 
                            <Bluetooth className="w-5 h-5 text-muted-foreground" />
                        }
                        <div className="group-data-[collapsible=icon]:hidden">
                            {editingDeviceId === device.id ? (
                                <Input 
                                    value={tempName} 
                                    onChange={e => setTempName(e.target.value)} 
                                    className="h-8"
                                    onKeyDown={(e) => e.key === 'Enter' && handleEditSave()}
                                />
                            ) : (
                                <div>
                                    <p className="font-medium text-sm">{device.customName || device.name}</p>
                                    {device.customName && <p className="text-xs text-muted-foreground">{device.name}</p>}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1 group-data-[collapsible=icon]:hidden">
                        {editingDeviceId === device.id ? (
                            <>
                                <Button size="icon" variant="ghost" className="w-7 h-7" onClick={handleEditSave}><Check className="w-4 h-4" /></Button>
                                <Button size="icon" variant="ghost" className="w-7 h-7" onClick={handleEditCancel}><X className="w-4 h-4" /></Button>
                            </>
                        ) : (
                            <>
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    {getRssiIcon(device.rssi)}
                                    {device.rssi}
                                </Badge>
                                {device.connected && (
                                    <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => handleEditStart(device)}><Edit className="w-4 h-4" /></Button>
                                )}
                                <Button size="sm" variant={device.connected ? "secondary" : "default"} onClick={() => onConnectToggle(device.id)}>
                                    {device.connected ? "Disconnect" : "Connect"}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
              </li>
            ))}
          </ul>
      </div>
    </ScrollArea>
  );
}
