import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const apiBase = process.env.APNA_API_BASE ?? "https://darkred-coyote-647666.hostingersite.com/api";
const port = Number(process.env.PORT ?? 8081);

async function proxyJson(path, res) {
  try {
    const upstream = await fetch(`${apiBase}${path}`, {
      headers: { accept: "application/json" }
    });
    const body = await upstream.text();
    res.writeHead(upstream.status, {
      "content-type": upstream.headers.get("content-type") ?? "application/json",
      "cache-control": "no-store"
    });
    res.end(body);
  } catch (error) {
    res.writeHead(502, { "content-type": "application/json" });
    res.end(JSON.stringify({
      message: error instanceof Error ? error.message : "Unable to reach backend"
    }));
  }
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${port}`);

  if (url.pathname === "/api/properties") {
    await proxyJson(`/properties${url.search || "?limit=100"}`, res);
    return;
  }

  if (url.pathname === "/" || url.pathname === "/index.html") {
    const html = await readFile(join(root, "index.html"), "utf8");
    res.writeHead(200, {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store"
    });
    res.end(html);
    return;
  }

  res.writeHead(404, { "content-type": "text/plain" });
  res.end("Not found");
}).listen(port, "127.0.0.1", () => {
  console.log(`ApnaRooms tenant browser preview running at http://localhost:${port}`);
});
