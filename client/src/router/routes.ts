import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  },

  // Маршрут для коротких ссылок
  {
    path: '/:shortCode([a-zA-Z0-9_-]{3,20})',
    name: 'RedirectPage',
    component: () => import('pages/RedirectPage.vue'),
  },
];

export default routes;
