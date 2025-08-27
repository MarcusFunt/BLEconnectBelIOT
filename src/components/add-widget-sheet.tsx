
"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Device, Widget } from "@/lib/types";
import { getCharacteristicName } from "@/lib/bluetooth";
import { useEffect, type ReactNode } from "react";

interface AddWidgetSheetProps {
  children?: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddWidget: (widget: Omit<Widget, 'id'>) => void;
  connectedDevices: Device[];
}

const widgetFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  deviceId: z.string({ required_error: "Please select a device." }),
  dataType: z.string({ required_error: "Please select a data type." }),
  type: z.enum(["value", "gauge", "graph"], { required_error: "Please select a widget type." }),
  historyLength: z.coerce.number().int().min(1, "History length must be at least 1."),
  lineColor: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid color."),
  refreshRate: z.coerce.number().int().min(100, "Refresh rate must be at least 100ms."),
});

type WidgetFormValues = z.infer<typeof widgetFormSchema>;

export function AddWidgetSheet({ children, open, onOpenChange, onAddWidget, connectedDevices }: AddWidgetSheetProps) {
  const form = useForm<WidgetFormValues>({
    resolver: zodResolver(widgetFormSchema),
    defaultValues: {
      title: "",
      deviceId: "",
      dataType: "",
      type: "value",
      historyLength: 20,
      lineColor: "#8884d8",
      refreshRate: 2000,
    },
  });

  const selectedDeviceId = form.watch("deviceId");
  const selectedDevice = connectedDevices.find(d => d.id === selectedDeviceId);
  const availableDataTypes = selectedDevice ? Object.keys(selectedDevice.characteristics || {}) : [];
  const selectedWidgetType = form.watch("type");

  useEffect(() => {
    form.setValue("dataType", "");
  }, [selectedDeviceId, form]);

  function onSubmit(data: WidgetFormValues) {
    const { historyLength, lineColor, refreshRate, ...rest } = data;
    onAddWidget({ ...rest, settings: { historyLength, lineColor, refreshRate } });
    form.reset();
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {children && (
        <SheetTrigger asChild>
          {children}
        </SheetTrigger>
      )}
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add a new widget</SheetTitle>
          <SheetDescription>
            Configure your new widget to display data from a connected device.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Widget Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Living Room Temperature" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a connected device" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {connectedDevices.map(device => (
                        <SelectItem key={device.id} value={device.id}>
                          {device.customName || device.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dataType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a data type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableDataTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {getCharacteristicName(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Widget Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="value" id="value" />
                        </FormControl>
                        <FormLabel htmlFor="value" className="font-normal">Value</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="gauge" id="gauge" />
                        </FormControl>
                        <FormLabel htmlFor="gauge" className="font-normal">Gauge</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="graph" id="graph" />
                        </FormControl>
                        <FormLabel htmlFor="graph" className="font-normal">Graph</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedWidgetType === "graph" && (
              <>
                <FormField
                  control={form.control}
                  name="historyLength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>History Length</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lineColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Line Color</FormLabel>
                      <FormControl>
                        <Input type="color" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="refreshRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Refresh Rate (ms)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter>
              <Button type="submit">Create Widget</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
