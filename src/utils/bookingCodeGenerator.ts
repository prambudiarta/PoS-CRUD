import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from 'src/firebaseConfig';

export function generateUniqueCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function isCodeUnique(code: string) {
  const querySnapshot = await getDocs(
    query(collection(db, 'bookings'), where('code', '==', code))
  );
  return querySnapshot.empty;
}
