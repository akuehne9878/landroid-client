export interface UserData {
    id: number;
    user_type: string;
    push_notifications: boolean;
    location: string | null;
    mqtt_endpoint: string;
    actions_on_google_pin_code: string | null;
    created_at: string;
    updated_at: string;
};
