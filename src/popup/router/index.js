import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import store from '../store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
  },
  // {
  //     path: '/custom-titles/:titleId',
  //     name: 'customTitles',
  //     props: true,
  //     component: CustomTitles,
  //     meta: {
  //       requiresAuth: true
  //     }
  // },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
    meta: {
      requiresAuth: true
      }
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
  if(to.matched.some(record => record.meta.requiresAuth)) {
    console.log(localStorage.getItem('token'))
    console.log('does it require auth', store.getters['auth/user'], 'to', to, 'from', from )
    if (store.getters['auth/isLoggedIn']) {
      next();
      window.scrollTo(0, 0);
      return;
    }
    else {
        next('/login');
    }
        
  } else {
    next();
  }
})

export default router
