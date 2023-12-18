// src/authGuard.js

import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from 'src/firebaseConfig'; // Import the initialized app
import { useUserStore } from 'src/stores/user-store';

const auth = getAuth(app); // Get the auth instance from the initialized app

export const authGuard = (to: any, from: any, next: any) => {
  return new Promise((resolve, reject) => {
    try {
      onAuthStateChanged(
        auth,
        async (user) => {
          if (user) {
            const userStore = useUserStore();

            const currentUser = userStore.currentUser;
            if (to.meta.requiresAuth) {
              const requiredRoles = to.meta.role;
              const userRole = currentUser ? currentUser.role : null;

              if (!userRole) {
                resolve(next('/login'));
              }

              if (requiredRoles) {
                // Check if requiredRoles is an array and includes the userRole,
                // or if it's a string and matches the userRole
                const isAuthorized = Array.isArray(requiredRoles)
                  ? requiredRoles.includes(userRole)
                  : requiredRoles === userRole;

                if (!isAuthorized) {
                  resolve(next('/unauthorized'));
                } else {
                  resolve(next());
                }
              } else {
                resolve(next());
              }
            } else {
              resolve(next());
            }
          } else if (to.path === '/login') {
            resolve(next());
          } else {
            resolve(next('/login'));
          }
        },
        reject
      );
    } catch (e) {
      resolve(next('/login'));
    }
  });
};
