import Vue from 'vue'
import popupApp from './App.vue'
import store from './store'
import router from './router'
import vuetify from '../plugins/vuetify';

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  vuetify,
  render: h => h(popupApp)
})
