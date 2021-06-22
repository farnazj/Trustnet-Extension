export default {
    namespaced: true,
    state: {
      url: null
    },
    mutations: {
      set_url: (state, url) => {
        state.url = url;
      }
    },
    actions: {
      setUpPageUrl: function(context) {
        return new Promise((resolve, reject) => {
            context.commit('set_url', window.location.href.split('?')[0]);
            console.log('page url:', context.state.url);
            resolve();
        })
      }
    }
  }
  