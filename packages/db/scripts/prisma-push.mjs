import { spawnSync } from "node:child_process";

const acceptDataLoss = ["true", "1", "yes"].includes(
  String(process.env.PRISMA_ACCEPT_DATA_LOSS ?? "").toLowerCase()
);
const args = ["db", "push"];

if (acceptDataLoss) {
  args.push("--accept-data-loss");
}

console.log(`Running prisma ${args.join(" ")}`);

const result = spawnSync("prisma", args, {
  stdio: "inherit",
  shell: process.platform === "win32"
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
