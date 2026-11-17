import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/saved',
      name: 'saved',
      component: () => import('../views/SavedView.vue'),
    },
  ],
});

export default router;