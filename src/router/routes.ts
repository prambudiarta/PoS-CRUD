import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/AdminLayout.vue'),
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
        component: () => import('pages/lapangan/ShowFields.vue'),
      },
    ],
    meta: { requiresAuth: true, role: ['Customer Service', 'Manager'] },
  },
  {
    path: '/booking',
    component: () => import('layouts/AdminLayout.vue'),
    children: [
      {
        path: 'show', // Removed the leading '/'
        name: 'BookingShow',
        component: () => import('pages/booking/ShowBooking.vue'),
      },
      {
        path: 'summary', // Removed the leading '/'
        name: 'BookingSummary',
        component: () => import('pages/booking/SummaryBooking.vue'),
      },
    ],
    meta: { requiresAuth: true },
  },
  {
    path: '/user-management',
    component: () => import('layouts/AdminLayout.vue'),
    children: [
      {
        path: '',
        name: 'showUser',
        component: () => import('pages/User/ShowUsers.vue'),
      },
      { path: 'create', component: () => import('pages/User/CreateUser.vue') },
      { path: 'edit/:id', component: () => import('pages/User/EditUser.vue') },
    ],
    meta: { requiresAuth: true, role: 'Manager' },
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
