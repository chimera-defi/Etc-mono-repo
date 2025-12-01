import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/components/Blog/HomePage.vue';
import ContentPage from '@/components/Blog/ContentPage.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/:slug',
    name: 'ContentPage',
    component: ContentPage,
    props: true
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' };
    }
    return { top: 0 };
  }
});

export default router;
