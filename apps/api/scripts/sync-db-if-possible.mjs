import { spawnSync } from "node:child_process";

if (!process.env.DATABASE_URL) {
  console.log("DATABASE_URL is not set; skipping Prisma db push.");
  process.exit(0);
}

const acceptDataLoss = ["true", "1", "yes"].includes(
  String(process.env.PRISMA_ACCEPT_DATA_LOSS ?? "").toLowerCase()
);
const prismaArgs = ["--filter", "@apnarooms/db", "exec", "prisma", "db", "push"];

if (acceptDataLoss) {
  prismaArgs.push("--accept-data-loss");
}

console.log(
  `DATABASE_URL found; syncing Prisma schema to database${acceptDataLoss ? " with --accept-data-loss" : ""}.`
);

const result = spawnSync(
  "pnpm",
  prismaArgs,
  {
    stdio: "inherit",
    shell: process.platform === "win32"
  }
);

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
