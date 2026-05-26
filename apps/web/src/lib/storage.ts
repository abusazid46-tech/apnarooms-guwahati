import { getFirebaseStorage } from "./firebase";

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";

async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData
  });

  const result = await response.json();
  if (!response.ok || !result.secure_url) {
    throw new Error(result.error?.message ?? "Cloudinary upload failed.");
  }

  return result.secure_url as string;
}

export async function uploadPropertyImage(file: File, propertyId: string): Promise<string> {
  if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET) {
    return uploadToCloudinary(file);
  }

  try {
    const [{ getDownloadURL, ref, uploadBytes }, storage] = await Promise.all([
      import("firebase/storage"),
      getFirebaseStorage()
    ]);
    const storageRef = ref(storage, `properties/${propertyId}/${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file, { contentType: file.type });
    return getDownloadURL(storageRef);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown upload error";
    throw new Error(`Image upload failed. Add Cloudinary env vars, or enable Firebase Storage/Blaze and bucket CORS, or paste image URLs instead. ${detail}`);
  }
}
