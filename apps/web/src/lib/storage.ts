import { getFirebaseStorage } from "./firebase";

export async function uploadPropertyImage(file: File, propertyId: string): Promise<string> {
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
    throw new Error(`Image upload failed. Enable Firebase Storage/Blaze and bucket CORS, or paste image URLs instead. ${detail}`);
  }
}
