import * as dotenv from "dotenv"; // Load environment variables
import { LandroidClient } from "./LandroidClient";
import { MowerStatus } from "./types";

// Load .env configuration
dotenv.config();

// Example usage
(async () => {
  const email = process.env.WORX_EMAIL;
  const password = process.env.WORX_PASSWORD;
  const clientId = process.env.WORX_CLIENT_ID;

  if (!email || !password || !clientId) {
    console.error("Error: WORX_EMAIL, WORX_PASSWORD, and WORX_CLIENT_ID must be set in your environment variables.");
    process.exit(1);
  }

  try {
    const client: LandroidClient = await LandroidClient.getInstance(email, password, clientId);
    const status : MowerStatus =  await client.getMowerStatus();

    console.log("Battery Level:", status.dat.bt.p);
    
  } catch (err: any) {
    console.error(err.message);
  }
})();




