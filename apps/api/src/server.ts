import "dotenv/config";
import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

app.listen(env.API_PORT, "0.0.0.0", () => {
  console.log(`ApnaRooms API listening on http://localhost:${env.API_PORT}`);
});
