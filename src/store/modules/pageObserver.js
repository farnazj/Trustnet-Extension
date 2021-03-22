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

          const callback = generalUtils.throttle(function(mutationsList, observer) {
            console.log('going to execute callback **')
            let childMutation = false;
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    childMutation = true;
                }
            }
            if (childMutation) {
                console.log('A child node has been added or removed.');
                state.observer.takeRecords();
                state.observer.disconnect();
                store.dispatch('titles/setUpTitles');
            }
          }, 5000);
  
          state.observer = new MutationObserver(callback);
          document.addEventListener('DOMContentLoaded', function() {
              state.observer.observe(targetNode, state.config);    
          }, false);
        }

      },

      disconnect_observer: (state) => {
        console.log('observer disconnected')
        state.observer.disconnect();
      },

      reconnect_observer: (state) => {
        const targetNode = document.body;
        state.observer.observe(targetNode, state.config);
        console.log('observer reconnected')
    
      }
    },
    actions: {
      setUpObserver: function(context) {  
        return new Promise((resolve, reject) => {
            context.commit('setup_observer');
            resolve;
        })
      },

      disconnectObserver: function(context) {
        return new Promise((resolve, reject) => {
          context.commit('disconnect_observer');
          resolve;
        })
      },

      reconnectObserver: function(context) {
        return new Promise((resolve, reject) => {
          context.commit('reconnect_observer');
          resolve;
        })
      }
  
    }
  }
  