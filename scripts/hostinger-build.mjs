import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const isWindows = process.platform === "win32";

function binName(name) {
  return isWindows ? `${name}.cmd` : name;
}

function localBin(name, cwd) {
  const candidates = [
    path.join(cwd, "node_modules", ".bin", binName(name)),
    path.join(rootDir, "node_modules", ".bin", binName(name))
  ];

  const command = candidates.find((candidate) => fs.existsSync(candidate));
  return command ?? candidates[candidates.length - 1];
}

function run(command, args, cwd, options = {}) {
  console.log(`$ ${[command, ...args].join(" ")}`);

  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: options.shell ?? isWindows
  });

  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const sharedDir = path.join(rootDir, "packages", "shared");
const dbDir = path.join(rootDir, "packages", "db");
const apiDir = path.join(rootDir, "apps", "api");
const webDir = path.join(rootDir, "apps", "web");

run(localBin("tsc", sharedDir), [], sharedDir);
run(localBin("prisma", dbDir), ["generate"], dbDir);
run(localBin("tsc", dbDir), [], dbDir);
run(process.execPath, [path.join(apiDir, "scripts", "sync-db-if-possible.mjs")], apiDir, { shell: false });
run(localBin("tsc", apiDir), [], apiDir);
process.env.NEXT_TELEMETRY_DISABLED ??= "1";
process.env.NEXT_PRIVATE_BUILD_WORKER ??= "1";
run(localBin("next", webDir), ["build"], webDir);
