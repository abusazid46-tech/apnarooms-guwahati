import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const webDir = path.join(rootDir, "apps", "web");
const webRequire = createRequire(path.join(webDir, "package.json"));
const next = webRequire("next");

const port = Number(process.env.PORT ?? process.env.API_PORT ?? 4000);

function loadEnvFile() {
  const envPath = path.join(rootDir, ".env");

  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    process.env[key] ??= value;
  }
}

async function start() {
  loadEnvFile();
  const { createApp } = await import("./apps/api/dist/app.js");
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
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
