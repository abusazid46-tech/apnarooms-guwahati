import { prisma } from "@apnarooms/db";
import { createAdminNotification } from "../notifications/notifications.service.js";
import { ApiError } from "../../utils/api-error.js";

type PropertyInput = {
  title: string;
  slug?: string;
  description?: string;
  category: "PG" | "HOMESTAY" | "FLAT" | "ROOM";
  status?: "DRAFT" | "PUBLISHED" | "UNPUBLISHED" | "ARCHIVED";
  rentMonthly: number;
  depositAmount?: number;
  tokenAmount: number;
  locality: string;
  city?: string;
  address?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  latitude?: number;
  longitude?: number;
  isVerified?: boolean;
  isAvailable?: boolean;
  amenities?: string[];
  landlordId?: string;
  images?: ImageInput[];
};

type ImageInput = {
  url: string;
  path?: string;
  alt?: string;
  sortOrder?: number;
};

const propertyInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  landlord: {
    select: {
      id: true,
      name: true,
      phone: true,
      email: true
    }
  }
};

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asNumber(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function asBoolean(value: unknown) {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildWhere(query: Record<string, unknown>, admin = false): any {
  const search = asString(query.search);
  const category = asString(query.category);
  const locality = asString(query.locality);
  const city = asString(query.city);
  const status = asString(query.status);
  const minPrice = asNumber(query.minPrice);
  const maxPrice = asNumber(query.maxPrice);
  const isVerified = asBoolean(query.verified);
  const isAvailable = asBoolean(query.available);

  return {
    ...(!admin ? { status: "PUBLISHED", isAvailable: true } : status ? { status } : {}),
    ...(category ? { category } : {}),
    ...(locality ? { locality: { contains: locality, mode: "insensitive" } } : {}),
    ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
    ...(typeof isVerified === "boolean" ? { isVerified } : {}),
    ...(admin && typeof isAvailable === "boolean" ? { isAvailable } : {}),
    ...(minPrice || maxPrice
      ? {
          rentMonthly: {
            ...(minPrice ? { gte: minPrice } : {}),
            ...(maxPrice ? { lte: maxPrice } : {})
          }
        }
      : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { locality: { contains: search, mode: "insensitive" } },
            { city: { contains: search, mode: "insensitive" } },
            { address: { contains: search, mode: "insensitive" } }
          ]
        }
      : {})
  };
}

function pagination(query: Record<string, unknown>) {
  const page = Math.max(1, asNumber(query.page) ?? 1);
  const limit = Math.min(100, Math.max(1, asNumber(query.limit) ?? 20));
  return { page, limit, skip: (page - 1) * limit };
}

export async function listProperties(query: Record<string, unknown>) {
  const { page, limit, skip } = pagination(query);
  const where = buildWhere(query);

  const [properties, total] = await prisma.$transaction([
    prisma.property.findMany({
      where,
      include: propertyInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.property.count({ where })
  ]);

  return { properties, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export async function listAdminProperties(query: Record<string, unknown>) {
  const { page, limit, skip } = pagination(query);
  const where = buildWhere(query, true);

  const [properties, total] = await prisma.$transaction([
    prisma.property.findMany({
      where,
      include: propertyInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.property.count({ where })
  ]);

  return { properties, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export async function getPublicProperty(idOrSlug: string) {
  const property = await prisma.property.findFirst({
    where: {
      status: "PUBLISHED",
      isAvailable: true,
      OR: [{ id: idOrSlug }, { slug: idOrSlug }]
    },
    include: propertyInclude
  });

  if (!property) throw new ApiError(404, "Property not found");
  return property;
}

export async function getAdminProperty(id: string) {
  const property = await prisma.property.findUnique({
    where: { id },
    include: propertyInclude
  });

  if (!property) throw new ApiError(404, "Property not found");
  return property;
}

export async function listOwnerProperties(firebaseUid: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { firebaseUid } });

  return prisma.property.findMany({
    where: { landlordId: user.id },
    include: propertyInclude,
    orderBy: { createdAt: "desc" }
  });
}

export async function getOwnerProperty(firebaseUid: string, id: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { firebaseUid } });
  const property = await prisma.property.findFirst({
    where: { id, landlordId: user.id },
    include: propertyInclude
  });

  if (!property) throw new ApiError(404, "Property not found");
  return property;
}

export async function createProperty(input: PropertyInput) {
  const slug = input.slug ?? `${slugify(input.title)}-${Date.now().toString(36)}`;

  return prisma.property.create({
    data: {
      title: input.title,
      slug,
      description: input.description,
      category: input.category,
      status: input.status ?? "DRAFT",
      rentMonthly: input.rentMonthly,
      depositAmount: input.depositAmount,
      tokenAmount: input.tokenAmount,
      locality: input.locality,
      city: input.city ?? "Guwahati",
      address: input.address,
      ownerName: input.ownerName,
      ownerPhone: input.ownerPhone,
      ownerEmail: input.ownerEmail,
      latitude: input.latitude,
      longitude: input.longitude,
      isVerified: input.isVerified ?? false,
      isAvailable: input.isAvailable ?? true,
      amenities: input.amenities ?? [],
      landlordId: input.landlordId,
      images: input.images?.length
        ? {
            create: input.images.map((image, index) => ({
              url: image.url,
              path: image.path,
              alt: image.alt,
              sortOrder: image.sortOrder ?? index
            }))
          }
        : undefined
    },
    include: propertyInclude
  });
}

export async function createOwnerProperty(firebaseUid: string, input: PropertyInput) {
  const user = await prisma.user.findUniqueOrThrow({ where: { firebaseUid } });

  if (user.role === "USER") {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "LANDLORD" }
    });
  }

  const property = await createProperty({
    ...input,
    status: "DRAFT",
    isVerified: false,
    isAvailable: input.isAvailable ?? true,
    landlordId: user.id
  });

  await createAdminNotification({
    type: "OWNER_PROPERTY_SUBMITTED",
    title: "New owner listing needs approval",
    body: `${property.ownerName ?? user.name ?? user.email ?? user.phone ?? "A property owner"} submitted ${property.title} in ${property.locality}. Contact: ${property.ownerPhone ?? property.ownerEmail ?? "not provided"}.`,
    href: "/admin/properties"
  });

  return property;
}

export async function updateProperty(id: string, input: Partial<PropertyInput>) {
  await getAdminProperty(id);

  return prisma.$transaction(async (tx: any) => {
    if (input.images) {
      await tx.propertyImage.deleteMany({ where: { propertyId: id } });
    }

    return tx.property.update({
      where: { id },
      data: {
        title: input.title,
        slug: input.slug,
        description: input.description,
        category: input.category,
        status: input.status,
        rentMonthly: input.rentMonthly,
        depositAmount: input.depositAmount,
        tokenAmount: input.tokenAmount,
        locality: input.locality,
        city: input.city,
        address: input.address,
        ownerName: input.ownerName,
        ownerPhone: input.ownerPhone,
        ownerEmail: input.ownerEmail,
        latitude: input.latitude,
        longitude: input.longitude,
        isVerified: input.isVerified,
        isAvailable: input.isAvailable,
        amenities: input.amenities,
        landlordId: input.landlordId,
        images: input.images
          ? {
              create: input.images.map((image, index) => ({
                url: image.url,
                path: image.path,
                alt: image.alt,
                sortOrder: image.sortOrder ?? index
              }))
            }
          : undefined
      },
      include: propertyInclude
    });
  });
}

export async function updateOwnerProperty(firebaseUid: string, id: string, input: Partial<PropertyInput>) {
  const existing = await getOwnerProperty(firebaseUid, id);

  const property = await updateProperty(id, {
    ...input,
    status: "DRAFT",
    isVerified: false,
    landlordId: undefined
  });

  await createAdminNotification({
    type: "OWNER_PROPERTY_UPDATED",
    title: "Owner listing edited",
    body: `${property.ownerName ?? property.landlord?.name ?? property.landlord?.email ?? "A property owner"} edited ${existing.title}. Review before publishing.`,
    href: "/admin/properties"
  });

  return property;
}

export async function updateOwnerAvailability(firebaseUid: string, id: string, isAvailable: boolean) {
  await getOwnerProperty(firebaseUid, id);

  return prisma.property.update({
    where: { id },
    data: { isAvailable },
    include: propertyInclude
  });
}

export async function archiveProperty(id: string) {
  await getAdminProperty(id);

  return prisma.property.update({
    where: { id },
    data: { status: "ARCHIVED", isAvailable: false },
    include: propertyInclude
  });
}

export async function addPropertyImage(propertyId: string, input: ImageInput) {
  await getAdminProperty(propertyId);

  return prisma.propertyImage.create({
    data: {
      propertyId,
      url: input.url,
      path: input.path,
      alt: input.alt,
      sortOrder: input.sortOrder ?? 0
    }
  });
}

export async function addOwnerPropertyImage(firebaseUid: string, propertyId: string, input: ImageInput) {
  await getOwnerProperty(firebaseUid, propertyId);

  return prisma.propertyImage.create({
    data: {
      propertyId,
      url: input.url,
      path: input.path,
      alt: input.alt,
      sortOrder: input.sortOrder ?? 0
    }
  });
}

export async function deletePropertyImage(propertyId: string, imageId: string) {
  const image = await prisma.propertyImage.findFirst({ where: { id: imageId, propertyId } });
  if (!image) throw new ApiError(404, "Property image not found");
  await prisma.propertyImage.delete({ where: { id: imageId } });
}
