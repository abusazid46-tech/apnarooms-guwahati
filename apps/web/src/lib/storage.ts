import { getFirebaseStorage } from "./firebase";

export async function uploadPropertyImage(file: File, propertyId: string): Promise<string> {
  const [{ getDownloadURL, ref, uploadBytes }, storage] = await Promise.all([
    import("firebase/storage"),
    getFirebaseStorage()
  ]);
  const storageRef = ref(storage, `properties/${propertyId}/${Date.now()}-${file.name}`);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}
