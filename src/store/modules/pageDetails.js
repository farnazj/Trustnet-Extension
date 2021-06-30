export default {
    namespaced: true,
    state: {
      url: null,
      articleId: null
    },
    mutations: {
      set_url: (state, url) => {
        state.url = url;
      },
      set_article_id: (state, id) => {
        state.articleId = id;
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
            console.log('article id is', response.id)
            context.commit('set_article_id', response.id);
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
  