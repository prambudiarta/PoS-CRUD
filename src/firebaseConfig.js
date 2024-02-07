// src/firebaseConfig.js

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration (replace with your own config)
const firebaseConfig = {
  apiKey: 'AIzaSyCT3s40YU07yBPMb_iCXNdzndC06OZRmlE',
  authDomain: 'cibabat-park.firebaseapp.com',
  projectId: 'cibabat-park',
  storageBucket: 'cibabat-park.appspot.com',
  messagingSenderId: '65138143566',
  appId: '1:65138143566:web:d42d7f5483c82208cd6e1f',
  measurementId: 'G-4TQVYJD68T',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

export { db, storage, app };
