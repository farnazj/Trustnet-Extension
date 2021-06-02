import Vue from 'vue'
import insertedApp from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  render: h => h(insertedApp)
}).$mount('#app')

router.replace('/');