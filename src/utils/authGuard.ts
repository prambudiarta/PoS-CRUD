// src/authGuard.js

import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from 'src/firebaseConfig'; // Import the initialized app

const auth = getAuth(app); // Get the auth instance from the initialized app

export const authGuard = (to: any, from: any, next: any) => {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(
      auth,
      (user) => {
        if (user || to.path === '/login') {
          // User is signed in, or they're trying to access the login page
          resolve(next());
        } else {
          // No user is signed in, redirect to the login page
          resolve(next('/login'));
        }
      },
      reject
    );
  });
};
