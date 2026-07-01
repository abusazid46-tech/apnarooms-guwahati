import { spawnSync } from "node:child_process";

const packages = ["@apnarooms/shared", "@apnarooms/db", "@apnarooms/api"];

function runPnpm(args) {
  const command = process.env.npm_execpath ? process.execPath : "pnpm";
  const commandArgs = process.env.npm_execpath
    ? [process.env.npm_execpath, ...args]
    : args;

  const result = spawnSync(command, commandArgs, {
    stdio: "inherit",
    shell: false
  });

  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

for (const packageName of packages) {
  runPnpm(["--filter", packageName, "build"]);
}
