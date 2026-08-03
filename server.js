import "dotenv/config";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createApp } from "./apps/api/dist/app.js";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const webDir = path.join(rootDir, "apps", "web");
const webRequire = createRequire(path.join(webDir, "package.json"));
const next = webRequire("next");

const port = Number(process.env.PORT ?? process.env.API_PORT ?? 4000);
const app = createApp();

if (process.env.SERVE_WEB !== "false") {
  const webApp = next({ dev: false, dir: webDir });
  const handle = webApp.getRequestHandler();

  await webApp.prepare();
  app.use((req, res) => handle(req, res));
}

app.listen(port, "0.0.0.0", () => {
  console.log(`ApnaRooms listening on http://localhost:${port}`);
});
