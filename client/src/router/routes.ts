import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'manage', component: () => import('pages/ManageLinksPage.vue') },
    ],
  },

  // Маршрут для коротких ссылок
  {
    path: '/:shortCode',
    name: 'RedirectPage',
    component: () => import('pages/RedirectPage.vue'),
  },
];

export default routes;
