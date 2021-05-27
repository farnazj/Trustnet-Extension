import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/views/Home.vue'
import CustomTitles from '@/views/CustomTitles.vue'
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
    path: '/custom-titles/:titleId',
    name: 'customTitles',
    props: true,
    component: CustomTitles,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
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
  routes
})

router.beforeEach((to, from, next) => {
  console.log('router from where to where', to, from, store.getters['auth/isLoggedIn'], JSON.stringify(localStorage.getItem('trustnetAuthToken')))
  if(to.matched.some(record => record.meta.requiresAuth)) {
    if (localStorage.getItem('trustnetAuthToken')) {
      next();
      window.scrollTo(0, 0);
      return;
    }
    else
      next('/login');
  } else {
    next();
  }
})

export default router;
