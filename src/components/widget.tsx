
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MoreVertical, Trash2, Thermometer, Droplets, Battery } from "lucide-react";
import type { Widget as WidgetType } from "@/lib/types";

interface WidgetProps {
  widget: WidgetType;
  data: number | undefined;
  deviceName: string;
  onRemove: (widgetId: string) => void;
}

const dataTypeIcons = {
  temperature: <Thermometer className="w-4 h-4 text-muted-foreground" />,
  humidity: <Droplets className="w-4 h-4 text-muted-foreground" />,
  battery: <Battery className="w-4 h-4 text-muted-foreground" />,
};

const getUnit = (dataType: WidgetType['dataType']) => {
  switch (dataType) {
    case 'temperature': return '°C';
    case 'humidity': return '%';
    case 'battery': return '%';
    default: return '';
  }
};

export function Widget({ widget, data, deviceName, onRemove }: WidgetProps) {
  const unit = getUnit(widget.dataType);
  const displayValue = data !== undefined ? data.toFixed(1) : '--';
  const normalizeValue = (value: number, dataType: WidgetType['dataType']) => {
    const ranges: Record<WidgetType['dataType'], { min: number; max: number }> = {
      temperature: { min: -10, max: 50 },
      humidity: { min: 0, max: 100 },
      battery: { min: 0, max: 100 },
    };
    const range = ranges[dataType] ?? { min: 0, max: 100 };
    const clamped = Math.min(Math.max(value, range.min), range.max);
    return ((clamped - range.min) / (range.max - range.min)) * 100;
  };
  const progressValue =
    data !== undefined ? normalizeValue(data, widget.dataType) : 0;
  
  const formattedDataType = widget.dataType.charAt(0).toUpperCase() + widget.dataType.slice(1);

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
      </CardContent>
      <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{deviceName}</span>
        <div className="flex items-center gap-1.5">
          {dataTypeIcons[widget.dataType]}
          <span>{formattedDataType}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
