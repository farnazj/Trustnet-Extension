import Vue from 'vue'
import optionsApp from './App.vue'
import store from '@/store'
import vuetify from '@/plugins/vuetify';
import router from './router'

/* eslint-disable no-new */
new Vue({
  router,
  store,
  vuetify,
  render: h => h(optionsApp)
}).$mount('#trustnetApp')

router.replace('/');