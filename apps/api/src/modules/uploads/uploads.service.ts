import { prisma } from "@apnarooms/db";
import { ApiError } from "../../utils/api-error.js";

type UploadedImageInput = {
  propertyId: string;
  url: string;
  path?: string;
  alt?: string;
  sortOrder?: number;
};

export async function saveUploadedPropertyImage(input: UploadedImageInput) {
  const property = await prisma.property.findUnique({ where: { id: input.propertyId } });
  if (!property) throw new ApiError(404, "Property not found");

  return prisma.propertyImage.create({
    data: {
      propertyId: input.propertyId,
      url: input.url,
      path: input.path,
      alt: input.alt,
      sortOrder: input.sortOrder ?? 0
    }
  });
}

export async function deleteUploadedPropertyImage(id: string) {
  const image = await prisma.propertyImage.findUnique({ where: { id } });
  if (!image) throw new ApiError(404, "Image not found");

  await prisma.propertyImage.delete({ where: { id } });
}
