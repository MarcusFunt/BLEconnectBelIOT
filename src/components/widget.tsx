
"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MoreVertical, Trash2 } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import type { Widget as WidgetType } from "@/lib/types";
import { getCharacteristicName, getCharacteristicUnit } from "@/lib/bluetooth";

interface WidgetProps {
  widget: WidgetType;
  data: number | undefined;
  deviceName: string;
  onRemove: (widgetId: string) => void;
}

export function Widget({ widget, data, deviceName, onRemove }: WidgetProps) {
  const unit = getCharacteristicUnit(widget.dataType);
  const { historyLength, lineColor, refreshRate } = widget.settings;
  const [displayData, setDisplayData] = useState<number | undefined>();
  const [history, setHistory] = useState<{ time: number; value: number }[]>([]);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    if (data === undefined) return;
    const now = Date.now();
    if (now - lastUpdateRef.current < refreshRate) return;
    lastUpdateRef.current = now;
    setDisplayData(data);
    setHistory(prev => {
      const next = [...prev, { time: now, value: data }];
      return next.slice(-historyLength);
    });
  }, [data, refreshRate, historyLength]);
  
  const displayValue = displayData !== undefined ? displayData.toFixed(1) : '--';
  const progressValue = displayData !== undefined ? displayData : 0;
  const displayName = getCharacteristicName(widget.dataType);
  const formattedDataType = displayName.charAt(0).toUpperCase() + displayName.slice(1);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">{widget.title}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-6 h-6">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onRemove(widget.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
              <Trash2 className="w-4 h-4 mr-2" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-1">
        {widget.type === 'value' && (
          <div className="text-5xl font-bold tracking-tighter transition-colors duration-300">
            {displayValue}{unit}
          </div>
        )}
        {widget.type === 'gauge' && (
          <div className="flex flex-col gap-2">
            <div className="text-5xl font-bold tracking-tighter transition-colors duration-300">
              {displayValue}{unit}
            </div>
            <Progress value={progressValue} className="h-3" />
          </div>
        )}
        {widget.type === 'graph' && (
          <div className="w-full h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tickFormatter={t => new Date(t).toLocaleTimeString()} />
                <YAxis unit={unit} />
                <Tooltip
                  formatter={(value: number) => `${value.toFixed(1)}${unit}`}
                  labelFormatter={label => new Date(label).toLocaleTimeString()}
                />
                <Line type="monotone" dataKey="value" stroke={lineColor} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{deviceName}</span>
        <span>{formattedDataType}</span>
      </CardFooter>
    </Card>
  );
}
