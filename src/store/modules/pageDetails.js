import utils from '@/services/utils'
import constants from '@/lib/constants'

export default {
    namespaced: true,
    state: {
      url: null,
      article: null,
      isBlacklisted: false,
      timeOpened: null
    },
    mutations: {
      set_url: (state, url) => {
        state.url = url;
      },
      set_article: (state, article) => {
        state.article = article;
      },
      set_black_list_status: (state, status) => {
        state.isBlacklisted = status;
      },
      set_time_opened: (state) => {
        state.timeOpened = Date.now();
        console.log('time opened', state.timeOpened)
      }
    },
    actions: {

      setUpURLObserver: function(context) {
        let lastUrl = window.location.href; 
        new MutationObserver(() => {
          const url = window.location.href;
          if (url !== lastUrl) {
            lastUrl = url;
            onUrlChange();
          }
        }).observe(document, { subtree: true, childList: true });
        
        function onUrlChange() {
          context.dispatch('setUpPageUrl')
          .then(() => {
            console.log('url has changed', context.state.url)
            context.dispatch('setBlackListStatus')
            .then(() => {
              context.dispatch('linkAssessments/clearAssessments', true, { root: true })
              .then(() => {
                context.dispatch('linkAssessments/setupLinkAssessments', true, { root: true })
              });
              context.dispatch('assessments/getPageAssessments', true, { root: true });
              // context.dispatch('assessments/getAuthUserPostAssessment', true, { root: true });
              console.log('getting assessments again as a result of url change');
            })
          
          });
          
        }
      },

      setUpPageUrl: function(context) {
        return new Promise((resolve, reject) => {
          let sanitizedUrl;
          if ( constants.DOMAINS_WITH_QUERY_PARAMS.some(el => 
            window.location.href.includes(el)))
            sanitizedUrl = window.location.href.split('&')[0];
          else
            sanitizedUrl = window.location.href.split('?')[0]
            
          context.commit('set_url', sanitizedUrl);
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
      },

      setBlackListStatus: function(context) {
        return new Promise((resolve, reject) => {
          let pageHostname = utils.extractHostname(context.state.url);
          let pageIsBlackListed = false;

          let allBlackLists = constants.GLOBAL_BLACKLISTED_DOMAINS;
          let userPreferences = context.rootState['preferences'].userPreferences;
          console.log('user preferences', userPreferences);
          if ('trustnetBlackListedWebsites' in userPreferences) {
            allBlackLists = allBlackLists.concat(userPreferences.trustnetBlackListedWebsites);
          }

          console.log('all blacklists', allBlackLists)
          console.log('page host name', pageHostname)
          pageIsBlackListed = allBlackLists.some(blacklistedWebsite => 
            pageHostname.includes(blacklistedWebsite)
          )
          context.commit('set_black_list_status', pageIsBlackListed);
          resolve();
        })
      },

      setTimeOpened: function (context) {
        return new Promise((resolve, reject) => {
          context.commit('set_time_opened');
          resolve();
        })
      }

    }
  }
  