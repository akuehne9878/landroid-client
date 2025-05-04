export interface Device {
    id: number;
    uuid: string;
    product_id: number;
    user_id: number;
    serial_number: string;
    mac_address: string;
    locked: boolean;
    firmware_version: string;
    firmware_auto_upgrade: boolean;
    sim: null;
    test: boolean;
    iot_registered: boolean;
    mqtt_registered: boolean;
    registered_at: string;
    online: boolean;
    protocol: number;
    pending_radio_link_validation: null;
    capabilities: string[];
    capabilities_available: [];
    mqtt_endpoint: string;
    mqtt_topics: {
      command_in: string;
      command_out: string;
    };
    name: string;
    blade_height_shift: number;
    push_notifications: boolean;
    push_notifications_level: string;
    pin_code: null;
    app_settings: null;
    warranty_registered: boolean;
    purchased_at: null;
    warranty_expires_at: null;
    setup_location: {
      latitude: number;
      longitude: number;
    };
    city: {
      id: number;
      country_id: number;
      name: string;
      latitude: number;
      longitude: number;
      created_at: string;
      updated_at: string;
    };
    time_zone: string;
    lawn_size: number;
    lawn_perimeter: number;
    auto_schedule_settings: {
      boost: number;
      exclusion_scheduler: {
        days: {
          slots: [];
          exclude_day: boolean;
        }[];
        exclude_nights: boolean;
      };
      grass_type: null;
      irrigation: null;
      nutrition: null;
      soil_type: null;
    };
    auto_schedule: boolean;
    improvement: boolean;
    diagnostic: boolean;
    distance_covered: number;
    mower_work_time: number;
    blade_work_time: number;
    blade_work_time_reset: number;
    blade_work_time_reset_at: string;
    battery_charge_cycles: number;
    battery_charge_cycles_reset: number;
    battery_charge_cycles_reset_at: null;
    created_at: string;
    updated_at: string;
  }