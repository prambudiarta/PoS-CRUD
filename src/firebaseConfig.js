// src/firebaseConfig.js

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration (replace with your own config)
const firebaseConfig = {
  apiKey: 'AIzaSyDTf_tw6NKIVFefraP6WfVzL9bADxGrRj8',
  authDomain: 'smartven-testing.firebaseapp.com',
  projectId: 'smartven-testing',
  storageBucket: 'smartven-testing.appspot.com',
  messagingSenderId: '355653422380',
  appId: '1:355653422380:web:b638369c0a21a30921f089',
  measurementId: 'G-HTSFJSQMCW',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

export { db, storage, app };
