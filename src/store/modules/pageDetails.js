export default {
    namespaced: true,
    state: {
      url: null,
      article: null
    },
    mutations: {
      set_url: (state, url) => {
        state.url = url;
      },
      set_article: (state, article) => {
        state.article = article;
      }
    },
    actions: {
      setUpPageUrl: function(context) {
        return new Promise((resolve, reject) => {
            context.commit('set_url', window.location.href.split('?')[0]);
            resolve();
        })
      },

      getArticleByUrl: function(context) {
        return new Promise((resolve, reject) => {
          browser.runtime.sendMessage({
            type: 'get_post_by_url',
            data: {
              headers: {
                url: context.state.url
              }
            }
          })
          .then(response => {
            console.log('article is', response)
            context.commit('set_article', response);
            resolve();
          })
          .catch(err => {
            console.log(err)
            reject();
          })
        })
      }
    }
  }
  