import { createRouter, createWebHistory } from 'vue-router';
import LoginForm from './components/LoginForm.vue';
import BlogDashboard from './components/BlogDashboard.vue';
import EmotionalStats from './components/EmotionalStats.vue';
import FavoritePosts from './components/FavoritePosts.vue';

const routes = [
  { path: '/', component: LoginForm },
  { 
    path: '/dashboard', 
    component: BlogDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/stats',
    component: EmotionalStats,
    meta: { requiresAuth: true }
  },
  {
    path: '/favorites',
    component: FavoritePosts,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, _, next) => { 
  if (to.meta.requiresAuth && !localStorage.getItem('token')) {
    next('/');
  } else {
    next();
  }
});

export default router;