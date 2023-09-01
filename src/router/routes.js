
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue'), name: 'index', meta: { requiresAuth: true } },
      { path: '/change-password', component: () => import('pages/ChangePassword.vue'), name: 'change-password', meta: { requiresAuth: true } },
      { path: '/wallets', component: () => import('pages/WalletsPage.vue'), name: 'wallets', meta: { requiresAuth: true } },
      { path: '/agents', component: () => import('pages/AgentsPage.vue'), name: 'agents', meta: { requiresAuth: true } },
      { path: '/login', component: () => import('pages/LoginPage.vue'), name: 'login', meta: { guest: true } },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
