import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  },

  // Явный маршрут для 404 (должен быть перед shortCode)
  {
    path: '/404',
    name: 'ErrorNotFound',
    component: () => import('pages/ErrorNotFound.vue'),
  },

  // Маршрут для коротких ссылок
  {
    path: '/:shortCode([a-zA-Z0-9_-]{3,20})',
    name: 'RedirectPage',
    component: () => import('pages/RedirectPage.vue'),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
