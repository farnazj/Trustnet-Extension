
export default {
  namespaced: true,
  state: {
      user: null
  },
  getters: {

  },
  mutations: {
    logout(state) {
        state.user = null;
    },
    update_user(state, user) {
        state.user = Object.assign({}, user);
    }
  },
  actions: {
    getUser: (context) => {

      return new Promise((resolve, reject) => {

        browser.runtime.sendMessage({
            type: 'get_user'
        })
        .then(authUser => {
            console.log('gereftim', authUser, 'auth user ine')
            context.commit('update_user', authUser);
            resolve();
       })
       .catch(err => {
         reject(err);
       })
      })
    },

    logout: ({commit}) => {

      return new Promise((resolve, reject) => {
        commit('logout');
        resolve();
      })
    }

  }
}
