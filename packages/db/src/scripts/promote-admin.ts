import { prisma } from "../prisma.js";

function argValue(name: string) {
  const prefix = `${name}=`;
  const fromEquals = process.argv.find((arg) => arg.startsWith(prefix));
  if (fromEquals) return fromEquals.slice(prefix.length).trim();

  const index = process.argv.indexOf(name);
  if (index >= 0) return process.argv[index + 1]?.trim();

  return undefined;
}

async function main() {
  const email = argValue("--email") ?? process.env.ADMIN_EMAIL;
  const phone = argValue("--phone") ?? process.env.ADMIN_PHONE;
  const firebaseUid = argValue("--uid") ?? process.env.ADMIN_FIREBASE_UID;

  const selectors: Array<{ email: string } | { phone: string } | { firebaseUid: string }> = [];
  if (email) selectors.push({ email });
  if (phone) selectors.push({ phone });
  if (firebaseUid) selectors.push({ firebaseUid });

  if (!selectors.length) {
    throw new Error("Pass --email, --phone, or --uid for the user you want to promote.");
  }

  const user = await prisma.user.findFirst({
    where: { OR: selectors }
  });

  if (!user) {
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, email: true, phone: true, role: true, createdAt: true }
    });

    console.table(recentUsers);
    throw new Error("No matching user found. Log in once on the website first, then run this again.");
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role: "ADMIN" },
    select: { id: true, email: true, phone: true, role: true }
  });

  console.log("Promoted user to ADMIN:");
  console.table([updated]);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
