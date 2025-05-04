import axios from "axios";
import { mqtt, iot } from "aws-iot-device-sdk-v2";
import { RootObject } from './types'; // Import the RootObject type
import { UserData } from "./UserData";
import { Device } from "./Device";

export class LandroidClient {
    private static instance: LandroidClient;
    private email: string;
    private password: string;
    private clientId: string;
    private userData: UserData | null = null;
    private deviceList: Device[] | null = null;

    private mqttConnection: mqtt.MqttClientConnection = {} as mqtt.MqttClientConnection;

    private accessToken: string = ""
    //private mqttClient: mqtt.MqttClient | null = null;

    private constructor(email: string, password: string, clientId: string) {
        this.email = email;
        this.password = password;
        this.clientId = clientId;
    }


    public static async getInstance(email: string, password: string, clientId: string): Promise<LandroidClient> {
        if (!LandroidClient.instance) {
            LandroidClient.instance = new LandroidClient(email, password, clientId);
            // await LandroidClient.instance.fetchAccessToken();
            // await LandroidClient.instance.fetchUserData();
            // await LandroidClient.instance.fetchDeviceList();

            await LandroidClient.instance.connectToAwsMqtt();
        }
        return LandroidClient.instance;
    }



    private async fetchAccessToken(): Promise<string> {
        const loginUrl = "https://id.worx.com/oauth/token";
        const userAgent = "Node.jsApplication";

        try {
            const response = await axios.post(
                loginUrl,
                {
                    client_id: this.clientId,
                    username: this.email,
                    password: this.password,
                    scope: "*",
                    grant_type: "password",
                },
                {
                    headers: {
                        accept: "application/json",
                        "content-type": "application/json",
                        "user-agent": userAgent,
                        "accept-language": "en-US",
                    },
                }
            );

            const { access_token } = response.data;
            console.log("Authentication successful!");
            return access_token;
        } catch (error: any) {
            console.error("Failed to authenticate:", error.response?.data || error.message);
            throw new Error("Authentication failed. Please check your credentials.");
        }
    }

    private async getAccessToken(): Promise<string> {
        if (!this.accessToken) {
            this.accessToken = await this.fetchAccessToken();
        }
        return this.accessToken;
    }

    private async getUserData(): Promise<UserData> {
        if (!this.userData) {
            this.userData = await this.fetchUserData();
        }
        return this.userData;
    }

    private async getDevice(): Promise<Device> {
        if (!this.deviceList) {
            this.deviceList = await this.fetchDeviceList();
        }
        return this.deviceList[0];
    }


    public fetchUserData = async (): Promise<UserData> => {
        const url = "https://api.worxlandroid.com/api/v2/users/me";
        try {
            const accessToken = await this.getAccessToken();
            const response = await axios.get<UserData>(url, {
                headers: {
                    accept: "application/json",
                    authorization: `Bearer ${accessToken}`,
                },
            });

            console.log("User data fetched successfully!");

            const userData: UserData = response.data;


            return userData;
        } catch (error: any) {
            console.error("Failed to fetch user data:", error.response?.data || error.message);
            throw new Error("Failed to fetch user data.");
        }
    };

    public fetchDeviceList = async (): Promise<Device[]> => {
        const url = "https://api.worxlandroid.com/api/v2/product-items";
        try {
            const accessToken = await this.getAccessToken();
            const response = await axios.get<Device[]>(url, {
                headers: {
                    accept: "application/json",
                    authorization: `Bearer ${accessToken}`,
                },
            });

            const deviceList: Device[] = response.data;

            console.log("Device list fetched successfully!");
            return deviceList;
        } catch (error: any) {
            console.error("Failed to fetch device list:", error.response?.data || error.message);
            throw new Error("Failed to fetch device list.");
        }
    }

    private async connectToAwsMqtt(): Promise<void> {

        const device: Device = await this.getDevice();

        try {
            console.log("Establishing MQTT connection...");
            const mqttClient = new mqtt.MqttClient();

            const configBuilder = await this.getConfigBuilder();
            const mqttConnection = mqttClient.new_connection(configBuilder.build());

            mqttConnection.on("connect", () => console.log("Connected to MQTT Broker!"));
            mqttConnection.on("error", (error) => console.error(`MQTT Error: ${error.message}`));
            mqttConnection.on("disconnect", () => console.log("Disconnected from MQTT Broker."));

            await mqttConnection.connect();

            mqttConnection.subscribe(device.mqtt_topics.command_out, mqtt.QoS.AtLeastOnce, (topic, payload) => {
                console.log(`Message received on topic "${topic}": ${payload.toString()}`);
                try {
                    const json = Buffer.from(payload);
                    const data: RootObject = JSON.parse(json.toString("utf-8"));
                    // Parse the JSON string and assert its type as RootObject

                    // Access properties of the RootObject
                    console.log(data.cfg.id); // Example: Accessing the ID
                    console.log(data.dat.mac); // Example: Accessing the MAC address
                    console.log("battery percentage: " + data.dat.bt.p); // Example: Accessing the battery percentage
                } catch (error) {
                    console.error("Failed to parse JSON:", error);
                }
            })

            this.mqttConnection = mqttConnection;

        } catch (error: any) {
            console.error("Failed to connect to MQTT Broker:", error.message);
        }

    }


    private async getConfigBuilder(): Promise<iot.AwsIotMqttConnectionConfigBuilder> {

        const mqttPrefix = "WX";
        const category = "iobroker";
        const uuid = this.generateRandomClientId(8, 64);

        const accessToken = await this.getAccessToken();
        const userData = await this.getUserData();
        const device: Device = await this.getDevice();

        const clientId = `${mqttPrefix}/USER/${userData.id}/${category}/${uuid}`;
        const accessTokenParts = accessToken?.replace(/_/g, "/").replace(/-/g, "+").split(".");

        const configBuilder = iot.AwsIotMqttConnectionConfigBuilder.new_default_builder();
        configBuilder.with_clean_session(false);
        configBuilder.with_client_id(clientId);
        configBuilder.with_endpoint(device.mqtt_endpoint);
        configBuilder.with_custom_authorizer(
            `iobroker?jwt=${encodeURIComponent(accessTokenParts[0])}.${encodeURIComponent(accessTokenParts[1])}`,
            "",
            encodeURIComponent(accessTokenParts[2]),
            "",
            category,
            category
        );

        return configBuilder;
    }

    private generateRandomClientId(min: number, max: number): string {
        const length = Math.floor(Math.random() * (max - min + 1) + min);
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

 

    public async ping() {
        const device: Device = await this.getDevice();
        const message = {
            "id": 1024 + Math.floor(Math.random() * (65535 - 1025)),                     // Randomly generated ID
            "cmd": 0,                       // Command type
            "lg": "de"                   // Language (e.g., "de" for German)
        }

        this.mqttConnection.publish(device.mqtt_topics.command_in, JSON.stringify(message), mqtt.QoS.AtLeastOnce);
        console.log("Ping message sent:", message);
    }


}