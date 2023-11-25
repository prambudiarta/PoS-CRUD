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

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
