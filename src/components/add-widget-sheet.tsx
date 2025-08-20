
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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Device, Widget } from "@/lib/types";
import { widgetDataTypes } from "@/lib/types";

interface AddWidgetSheetProps {
  children?: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddWidget: (widget: Omit<Widget, 'id'>) => void;
  connectedDevices: Device[];
}

const widgetFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  deviceId: z.string({ required_error: "Please select a device." }),
  dataType: z.enum(widgetDataTypes, { required_error: "Please select a data type." }),
  type: z.enum(["value", "gauge"], { required_error: "Please select a widget type." }),
});

type WidgetFormValues = z.infer<typeof widgetFormSchema>;

export function AddWidgetSheet({ children, open, onOpenChange, onAddWidget, connectedDevices }: AddWidgetSheetProps) {
  const form = useForm<WidgetFormValues>({
    resolver: zodResolver(widgetFormSchema),
    defaultValues: {
      title: "",
      type: "value",
    },
  });

  function onSubmit(data: WidgetFormValues) {
    onAddWidget(data as Omit<Widget, 'id'>);
    form.reset();
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {children && (
        <SheetTrigger asChild>
          {children}
        </SheetTrigger>
      )}
      <SheetContent>
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
                      {widgetDataTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
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
                    </RadioGroup>
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
