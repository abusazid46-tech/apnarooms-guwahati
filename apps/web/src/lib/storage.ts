const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";

type CloudinaryUploadResult = {
  secure_url?: string;
  public_id?: string;
  error?: {
    message?: string;
  };
};

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

  console.info("[ApnaRooms upload] Starting Cloudinary upload", {
    cloudName: CLOUDINARY_CLOUD_NAME,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type
  });

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData
  });

  const responseText = await response.text();
  let result: CloudinaryUploadResult = {};

  try {
    result = responseText ? JSON.parse(responseText) : {};
  } catch {
    console.error("[ApnaRooms upload] Cloudinary returned a non-JSON response", {
      status: response.status,
      body: responseText
    });
    throw new Error("Cloudinary upload failed because the response was not valid JSON.");
  }

  console.info("[ApnaRooms upload] Cloudinary response", {
    ok: response.ok,
    status: response.status,
    publicId: result.public_id,
    secureUrl: result.secure_url,
    error: result.error?.message
  });

  if (!response.ok || !result.secure_url) {
    console.error("[ApnaRooms upload] Cloudinary upload failed", {
      status: response.status,
      error: result.error?.message
    });
    throw new Error(result.error?.message ?? "Cloudinary upload failed. Check that the upload preset is unsigned.");
  }

  return result.secure_url as string;
}
