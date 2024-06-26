
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '/change-password', component: () => import('pages/ChangePassword.vue'), name: 'change-password', meta: { requiresAuth: true } },
      { path: '/wallets', component: () => import('pages/WalletsPage.vue'), name: 'wallets', meta: { requiresAuth: true } },
      { path: '/deposits', component: () => import('pages/DepositsPage.vue'), name: 'deposits', meta: { requiresAuth: true } },
      { path: '/withdraws', component: () => import('pages/WithdrawsPage.vue'), name: 'withdraws', meta: { requiresAuth: true } },
      { path: '/trc20-transactions', component: () => import('pages/Trc20TransactionsPage.vue'), name: 'trc20-transactions', meta: { requiresAuth: true } },
      { path: '/transfers', component: () => import('pages/TransfersPage.vue'), name: 'transfers', meta: { requiresAuth: true } },
      { path: '/agents', component: () => import('pages/AgentsPage.vue'), name: 'agents', meta: { requiresAuth: true } },
      { path: '', component: () => import('pages/LoginPage.vue'), name: 'login', meta: { guest: true } },
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
