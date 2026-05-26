const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";

function assertCloudinaryConfig() {
  const missing = [
    !CLOUDINARY_CLOUD_NAME ? "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME" : "",
    !CLOUDINARY_UPLOAD_PRESET ? "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET" : ""
  ].filter(Boolean);

  if (missing.length) {
    throw new Error(`Cloudinary upload is not configured. Add ${missing.join(" and ")} in the admin Vercel project, then redeploy.`);
  }
}

export async function uploadPropertyImage(file: File, _propertyId: string): Promise<string> {
  assertCloudinaryConfig();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData
  });

  const result = await response.json();
  if (!response.ok || !result.secure_url) {
    throw new Error(result.error?.message ?? "Cloudinary upload failed. Check that the upload preset is unsigned.");
  }

  return result.secure_url as string;
}
