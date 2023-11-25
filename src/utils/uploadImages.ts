// src/utils/uploadImage.js

import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { storage } from 'src/firebaseConfig';

async function uploadImage(file: File) {
  const imageRef = storageRef(storage, `images/${file.name}`);
  await uploadBytes(imageRef, file);
  return getDownloadURL(imageRef);
}

export default uploadImage;
