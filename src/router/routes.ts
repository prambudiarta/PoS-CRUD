import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayoutExample.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  },
  {
    path: '/admin',
    component: () => import('layouts/AdminLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
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
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
