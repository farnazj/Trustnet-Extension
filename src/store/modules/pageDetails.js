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
          console.log('dare mire url setup kone')
  
        return new Promise((resolve, reject) => {
            context.commit('set_url', window.location.href);
            console.log(context.state.url, 'url e page')
            resolve;
        })
      }
  
    }
  }
  