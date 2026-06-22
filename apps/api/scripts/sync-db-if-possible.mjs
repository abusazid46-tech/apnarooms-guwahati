import { spawnSync } from "node:child_process";

if (!process.env.DATABASE_URL) {
  console.log("DATABASE_URL is not set; skipping Prisma db push.");
  process.exit(0);
}

console.log("DATABASE_URL found; syncing Prisma schema to database.");

const result = spawnSync(
  "pnpm",
  ["--filter", "@apnarooms/db", "prisma:push"],
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
