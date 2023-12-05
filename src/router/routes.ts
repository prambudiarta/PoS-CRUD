import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayoutExample.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    name: 'dashboard',
    component: () => import('layouts/AdminLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('pages/LoginPage.vue'),
    meta: { public: true },
  },
  {
    path: '/lapangan',
    component: () => import('layouts/AdminLayout.vue'),
    children: [
      {
        path: 'show', // Removed the leading '/'
        name: 'LapanganShow',
        component: () => import('pages/item/ShowLapangan.vue'),
      },
    ],
    meta: { requiresAuth: true },
  },
  {
    path: '/booking',
    component: () => import('layouts/AdminLayout.vue'),
    children: [
      {
        path: 'show', // Removed the leading '/'
        name: 'BookingShow',
        component: () => import('pages/item/ShowBooking.vue'),
      },
    ],
    meta: { requiresAuth: true },
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
