import { prisma } from "@apnarooms/db";

export async function listProperties(query: Record<string, unknown>) {
  const search = typeof query.search === "string" ? query.search : undefined;

  return prisma.property.findMany({
    where: {
      status: "PUBLISHED",
      OR: search
        ? [
            { title: { contains: search, mode: "insensitive" } },
            { locality: { contains: search, mode: "insensitive" } },
            { city: { contains: search, mode: "insensitive" } }
          ]
        : undefined
    },
    include: { images: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function createProperty(input: {
  title: string;
  description?: string;
  category: "PG" | "HOMESTAY" | "FLAT" | "ROOM";
  rentMonthly: number;
  tokenAmount: number;
  locality: string;
  city?: string;
}) {
  return prisma.property.create({
    data: {
      title: input.title,
      description: input.description,
      category: input.category,
      rentMonthly: input.rentMonthly,
      tokenAmount: input.tokenAmount,
      locality: input.locality,
      city: input.city ?? "Guwahati"
    }
  });
}
