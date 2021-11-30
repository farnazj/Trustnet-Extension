import Vue from 'vue'
import Vuex from 'vuex'
import auth from './modules/auth'
import relatedSources from './modules/relatedSources'
import pageDetails from './modules/pageDetails'
import pageObserver from './modules/pageObserver'
import preferences from './modules/preferences'
import assessments from './modules/assessments'
import linkAssessments from './modules/linkAssessments'
import sourceLists from './modules/sourceLists'
import boosts from './modules/boosts'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    auth,
    relatedSources,
    pageDetails,
    pageObserver,
    preferences,
    assessments,
    linkAssessments,
    sourceLists,
    boosts
  }
})
