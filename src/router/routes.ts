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
    path: '/item',
    component: () => import('layouts/AdminLayout.vue'),
    children: [
      {
        path: 'create', // Removed the leading '/'
        name: 'ItemCreate',
        component: () => import('pages/item/CreateItem.vue'),
      },
      {
        path: 'show', // Removed the leading '/'
        name: 'ItemShow',
        component: () => import('pages/item/ShowItem.vue'),
      },
    ],
  },
  {
    path: '/category',
    component: () => import('layouts/AdminLayout.vue'),
    children: [
      {
        path: 'show', // Removed the leading '/'
        name: 'categoryShow',
        component: () => import('pages/item/ShowCategories.vue'),
      },
    ],
  },
  {
    path: '/room',
    component: () => import('layouts/AdminLayout.vue'),
    children: [
      {
        path: 'show', // Removed the leading '/'
        name: 'roomShow',
        component: () => import('pages/item/ShowRoom.vue'),
      },
    ],
  },
  {
    path: '/printer',
    component: () => import('layouts/AdminLayout.vue'),
    children: [
      {
        path: 'show', // Removed the leading '/'
        name: 'printerShow',
        component: () => import('pages/item/ShowPrinter.vue'),
      },
    ],
  },
  {
    path: '/order',
    component: () => import('layouts/AdminLayout.vue'),
    children: [
      {
        path: 'show', // Removed the leading '/'
        name: 'orderShow',
        component: () => import('pages/item/ShowOrder.vue'),
      },
    ],
  },
  {
    path: '/menu/:deviceId',
    component: () => import('pages/menu/MenuPage.vue'),
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
    meta: { requiresAuth: true, role: ['Customer Service', 'Manager'] },
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
