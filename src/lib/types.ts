
export const widgetDataTypes = [
  "temperature",
  "humidity",
  "battery",
  "generic_access",
  "generic_attribute",
  "immediate_alert",
  "link_loss",
  "glucose",
  "health_thermometer",
  "device_information",
  "heart_rate",
  "battery_service",
  "running_speed_and_cadence",
  "automation_io",
  "cycling_speed_and_cadence",
  "cycling_power",
  "environmental_sensing",
  "body_composition",
  "user_data",
  "weight_scale",
  "bond_management",
  "continuous_glucose_monitoring",
  "internet_protocol_support",
  "pulse_oximeter",
  "fitness_machine",
  "reconnection_configuration",
  "insulin_delivery",
  "binary_sensor",
  "emergency_configuration",
  "authorization_control",
  "physical_activity_monitor",
  "elapsed_time",
  "generic_health_sensor",
  "audio_input_control",
  "volume_control",
  "microphone_control",
  "audio_stream_control",
  "broadcast_audio_scan",
  "published_audio_capabilities",
  "basic_audio_announcement",
  "electronic_shelf_label",
  "industrial_measurement_device",
  "ranging",
  "hid_iso",
] as const;
export type WidgetDataType = (typeof widgetDataTypes)[number];

export type Device = {
  id: string;
  name: string;
  rssi: number;
  connected: boolean;
  customName?: string;
  device: BluetoothDevice;
  /**
   * Map of supported characteristic UUIDs keyed by their associated widget data type.
   * Populated when a device is connected and its services are discovered.
   */
  characteristics?: Partial<Record<WidgetDataType, BluetoothRemoteGATTCharacteristic>>;
};

export type WidgetType = 'value' | 'gauge' | 'graph';

export type Widget = {
  id: string;
  title: string;
  deviceId: string;
  dataType: WidgetDataType;
  type: WidgetType;
};
