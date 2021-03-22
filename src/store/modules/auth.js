
export default {
  namespaced: true,
  state: {
    status: '',
    token: JSON.parse(localStorage.getItem('token')) || ''
  },
  getters: {
    isLoggedIn: (state) => {
        return !!state.token;
    },
    authStatus: (state) => {
        return state.status;
      },
    user: (state) => {
        console.log('inja tuye user', state.token )

        if (Object.entries(state.token).length)
            return state.token;
        else {
            return JSON.parse(localStorage.getItem('token'));
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
        localStorage.removeItem('token');
    },

    update_user(state, user) {
        localStorage.setItem('token', JSON.stringify(user));
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
            console.log('gereftim', authUser, 'auth user ine')
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
                
                resolve(resp);
                
      
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
