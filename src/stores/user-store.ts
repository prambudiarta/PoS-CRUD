// src/stores/user.ts
import { defineStore } from 'pinia';
import { User } from 'src/types/interfaces';
import { parseJSONSafe } from 'src/utils/parseJSONsafe';

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: parseJSONSafe('currentUser'),
  }),
  getters: {
    getUserId: (state) => state.currentUser?.id,
    getUserEmail: (state) => state.currentUser?.email,
    getUserRole: (state) => state.currentUser?.role,
    isAuthenticated: (state) => !!state.currentUser,
  },
  actions: {
    setUser(user: User) {
      this.currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(user));
    },
    clearUser() {
      localStorage.removeItem('currentUser');
      this.currentUser = null;
    },
    updateUserRole(role: string) {
      if (this.currentUser) {
        this.currentUser.role = role;
      }
    },
  },
});
