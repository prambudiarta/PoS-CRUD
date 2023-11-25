// src/firebaseConfig.js

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration (replace with your own config)
const firebaseConfig = {
    apiKey: 'AIzaSyDpFkRTO8zUYmXiOGjzrBKNCFHPW0Ad0rU',
    authDomain: 'karaoke-pos.firebaseapp.com',
    projectId: 'karaoke-pos',
    storageBucket: 'karaoke-pos.appspot.com',
    messagingSenderId: '590803726251',
    appId: '1:590803726251:web:70dde7415d2212efe2acee'
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

export { db, storage };