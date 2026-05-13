import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getFirebaseStorage } from "./firebase";

export async function uploadPropertyImage(file: File, propertyId: string): Promise<string> {
  const storageRef = ref(getFirebaseStorage(), `properties/${propertyId}/${Date.now()}-${file.name}`);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}
