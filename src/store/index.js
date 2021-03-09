import Vue from 'vue'
import Vuex from 'vuex'
import titles from './modules/titles'
import auth from './modules/auth'
import relatedSources from './modules/relatedSources'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    titles,
    auth,
    relatedSources

  }
})
