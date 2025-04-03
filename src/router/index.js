import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/views/Home.vue'
import About from '@/views/About.vue'
import Login from '@/views/Login.vue'
import store from '@/store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    // component: () => import(/* webpackChunkName: "about" */ '@/views/About.vue')
    component: About
  },
  {
    path: '*',
    component: Home,
    meta: {
      requiresAuth: true
    }
  }
]

const router = new VueRouter({
  routes,
  mode: 'abstract'
})

router.beforeEach(async (to, from, next) => {

  const {trustnetAuthToken} = await browser.storage.local.get('trustnetAuthToken');

  console.log('router from where to where', to, from, store.getters['auth/isLoggedIn'], trustnetAuthToken);

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (trustnetAuthToken) {
      next();
      window.scrollTo(0, 0);
      return;
    } else {
      next('/login');
    }
  } else {
    next();
  }
})

export default router;
