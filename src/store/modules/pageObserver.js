import generalUtils from '@/lib/generalUtils'
import store from '..';

export default {
    namespaced: true,
    state: {
      observer: null,
      config: null
    },
    mutations: {
      setup_observer: (state) => {

        if (state.observer === null) {

          const targetNode = document.body;
          state.config = { attributes: false, childList: true, subtree: true };

          let insertedApp = document.querySelector('div[data-vuetify-trustnet]');
          let reheadlineApp = document.querySelector('div[data-vuetify-reheadline]');

          const callback = generalUtils.throttle(function(mutationsList, observer) {
            console.log('trustnet going to execute mutation callback **')
            let childMutation = false;
            for (const mutation of mutationsList) {
              console.log('mutation detected:', mutation);
                if (mutation.type === 'childList' && !insertedApp.contains(mutation.target) &&
                  (!reheadlineApp || !reheadlineApp.contains(mutation.target) )) {
                    childMutation = true;
                }
            }
            console.log('trustnet child mutation happened or not:', childMutation);
            if (childMutation) {
                console.log('Trustnet: A child node has been added or removed.');
                state.observer.takeRecords();
                state.observer.disconnect();
                store.dispatch('linkAssessments/setupLinkAssessments', true, { root: true })
            }
          }, 2000);
  
          state.observer = new MutationObserver(callback);
        }

      },

      disconnect_observer: (state) => {
        state.observer.takeRecords();
        state.observer.disconnect();
      },

      reconnect_observer: (state) => {
        const targetNode = document.body;
        state.observer.observe(targetNode, state.config);    
      }
    },
    actions: {
      setUpObserver: function(context) { 
        console.log('trustnet observer is set up') 
        return new Promise((resolve, reject) => {
            context.commit('setup_observer');
            resolve();
        })
      },

      disconnectObserver: function(context) {
        return new Promise((resolve, reject) => {
          context.commit('disconnect_observer');
          resolve();
        })
      },

      reconnectObserver: function(context) {
        return new Promise((resolve, reject) => {
          context.commit('reconnect_observer');
          resolve();
        })
      }
  
    }
  }
  