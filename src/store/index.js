import Vue from 'vue'
import Vuex from 'vuex'
import titles from './modules/titles'
import auth from './modules/auth'
import relatedSources from './modules/relatedSources'
import pageDetails from './modules/pageDetails'
import pageObserver from './modules/pageObserver'
import preferences from './modules/preferences'
import assessments from './modules/assessments'

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
    relatedSources,
    pageDetails,
    pageObserver,
    preferences,
    assessments
  }
})
