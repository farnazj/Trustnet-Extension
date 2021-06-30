
export default {
  namespaced: true,
  state: {
    status: '',
    token: JSON.parse(localStorage.getItem('trustnetAuthToken')) || ''
  },
  getters: {
    isLoggedIn: (state) => {
        return !!state.token;
    },
    authStatus: (state) => {
        return state.status;
     },
    user: (state) => {

      if (Object.entries(state.token).length)
          return state.token;
      else {
          return JSON.parse(localStorage.getItem('trustnetAuthToken'));
      }
    }
  },
  mutations: {
    auth_request(state){
      state.status = 'loading'
    },

    auth_success(state) {
      state.status = 'success';
    },

    auth_error(state) {
      state.status = 'error';
    },

    logout(state) {
      state.status = '';
      state.token = '';
      localStorage.removeItem('trustnetAuthToken');
    },

    update_user(state, user) {
      localStorage.setItem('trustnetAuthToken', JSON.stringify(user));
      state.token = Object.assign({}, user);
    }
  },
  actions: {
    getUser: (context) => {

      return new Promise((resolve, reject) => {

        browser.runtime.sendMessage({
            type: 'get_user'
        })
        .then(authUser => {
            console.log('got auth user:', authUser);
            if (authUser) {
                context.commit('update_user', authUser);
            }
            resolve(authUser);
       })
       .catch(err => {
         reject(err);
       })
      })
    },
    
    login: (context, user) => {
      return new Promise((resolve, reject) => {
          context.commit('auth_request')
          browser.runtime.sendMessage({
              type: 'login',
              data: {
                  reqBody: user
              }
          })
          .then(resp => {
              const user = resp.data.user;
              context.commit('auth_success');
              context.dispatch('getUser')
              .then(() => {
                resolve(resp);    
              })
          })
          .catch(err => {
              context.commit('auth_error');
              reject(err);
          })
      })
    },

    logout: ({commit}) => {

      return new Promise((resolve, reject) => {

        browser.runtime.sendMessage({
            type: 'logout'
        })
        .then( () => {
            commit('logout');
            resolve();
        })
        .catch(err => {
            reject(err);
        })
        
      })
    }

  }
}
