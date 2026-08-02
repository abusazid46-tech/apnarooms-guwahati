import { prisma } from "@apnarooms/db";
import { ApiError } from "../../utils/api-error.js";

type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

type ReviewInput = {
  propertyId?: string;
  name: string;
  phone?: string;
  email?: string;
  rating: number;
  body: string;
  source?: string;
};

const reviewInclude = {
  property: { select: { id: true, title: true, locality: true, rentMonthly: true } }
};

function clean(value?: string) {
  return value?.trim() || undefined;
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asNumber(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function pagination(query: Record<string, unknown>) {
  const page = Math.max(1, asNumber(query.page) ?? 1);
  const limit = Math.min(100, Math.max(1, asNumber(query.limit) ?? 20));
  return { page, limit, skip: (page - 1) * limit };
}

export async function createReview(input: ReviewInput) {
  const name = clean(input.name);
  const body = clean(input.body);
  if (!name || !body) throw new ApiError(400, "Review requires name and feedback");

  if (input.propertyId) {
    const property = await prisma.property.findUnique({ where: { id: input.propertyId } });
    if (!property) throw new ApiError(404, "Property not found");
  }

  const review = await prisma.review.create({
    data: {
      propertyId: clean(input.propertyId),
      name,
      phone: clean(input.phone),
      email: clean(input.email),
      rating: input.rating,
      body,
      source: clean(input.source) ?? "website",
      status: "PENDING"
    },
    include: reviewInclude
  });

  await prisma.adminNotification.create({
    data: {
      type: "REVIEW_SUBMITTED",
      title: "New customer review",
      body: `${review.name} submitted a ${review.rating} star review${review.property ? ` for ${review.property.title}` : ""}.`,
      href: "/admin/reviews"
    }
  }).catch(() => undefined);

  return review;
}

export async function listPublicReviews(query: Record<string, unknown>) {
  const limit = Math.min(50, Math.max(1, asNumber(query.limit) ?? 12));
  const propertyId = asString(query.propertyId);

  const reviews = await prisma.review.findMany({
    where: {
      status: "APPROVED",
      ...(propertyId ? { propertyId } : {})
    },
    include: reviewInclude,
    orderBy: { createdAt: "desc" },
    take: limit
  });

  return { reviews };
}

export async function listAdminReviews(query: Record<string, unknown>) {
  const { page, limit, skip } = pagination(query);
  const status = asString(query.status);
  const propertyId = asString(query.propertyId);
  const search = asString(query.search);

  const where: any = {
    ...(status ? { status } : {}),
    ...(propertyId ? { propertyId } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { body: { contains: search, mode: "insensitive" } }
          ]
        }
      : {})
  };

  const [reviews, total] = await prisma.$transaction([
    prisma.review.findMany({
      where,
      include: reviewInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.review.count({ where })
  ]);

  return { reviews, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export async function getReview(id: string) {
  const review = await prisma.review.findUnique({ where: { id }, include: reviewInclude });
  if (!review) throw new ApiError(404, "Review not found");
  return review;
}

export async function updateReviewStatus(id: string, status: ReviewStatus) {
  await getReview(id);
  return prisma.review.update({ where: { id }, data: { status }, include: reviewInclude });
}

export async function deleteReview(id: string) {
  await getReview(id);
  await prisma.review.delete({ where: { id } });
}
