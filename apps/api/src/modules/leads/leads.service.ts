import { prisma } from "@apnarooms/db";
import { ApiError } from "../../utils/api-error.js";

type LeadInput = {
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
  source?: string;
  propertyId?: string;
};

type LeadUpdateInput = LeadInput & {
  status?: "NEW" | "CONTACTED" | "VISIT_SCHEDULED" | "VISIT_COMPLETED" | "NEGOTIATION" | "TOKEN_PAID" | "MOVED_IN" | "LOST";
  assignedToId?: string | null;
};

const leadInclude = {
  property: { select: { id: true, title: true, locality: true, rentMonthly: true } },
  assignedTo: { select: { id: true, name: true, email: true, phone: true } }
};

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

export async function createLead(input: LeadInput) {
  if (!input.name && !input.phone && !input.email) {
    throw new ApiError(400, "Lead requires at least name, phone, or email");
  }

  if (input.propertyId) {
    const property = await prisma.property.findUnique({ where: { id: input.propertyId } });
    if (!property) throw new ApiError(404, "Property not found");
  }

  return prisma.lead.create({
    data: {
      name: input.name,
      phone: input.phone,
      email: input.email,
      message: input.message,
      source: input.source ?? "website",
      propertyId: input.propertyId
    },
    include: leadInclude
  });
}

export async function listAdminLeads(query: Record<string, unknown>) {
  const { page, limit, skip } = pagination(query);
  const status = asString(query.status);
  const propertyId = asString(query.propertyId);
  const assignedToId = asString(query.assignedToId);
  const search = asString(query.search);

  const where: any = {
    ...(status ? { status } : {}),
    ...(propertyId ? { propertyId } : {}),
    ...(assignedToId ? { assignedToId } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } }
          ]
        }
      : {})
  };

  const [leads, total] = await prisma.$transaction([
    prisma.lead.findMany({
      where,
      include: leadInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.lead.count({ where })
  ]);

  return { leads, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export async function getLead(id: string) {
  const lead = await prisma.lead.findUnique({ where: { id }, include: leadInclude });
  if (!lead) throw new ApiError(404, "Lead not found");
  return lead;
}

export async function updateLead(id: string, input: LeadUpdateInput) {
  await getLead(id);

  return prisma.lead.update({
    where: { id },
    data: {
      name: input.name,
      phone: input.phone,
      email: input.email,
      message: input.message,
      source: input.source,
      status: input.status,
      propertyId: input.propertyId,
      assignedToId: input.assignedToId
    },
    include: leadInclude
  });
}

export async function deleteLead(id: string) {
  await getLead(id);
  await prisma.lead.delete({ where: { id } });
}
