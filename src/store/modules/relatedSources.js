
export default {
  namespaced: true,
  state: {
    followedSources: [],
    trustedSources: [],
    followers: []
  },
  getters: {
    trustedIds: (state) => {
      return state.trustedSources.map(source => source.id);
    },
    followedIds: (state) => {
      return state.followedSources.map(source => source.id);
    },
    followedOrTrusteds: (state) => {

      let allSources = [];
      for (let key of [state.followedSources, state.trustedSources]) {

        key.forEach(source => {
          let index = allSources.findIndex(el => el.id == source.id);
          if (index == -1) {
            let newSource = Object.assign({}, source);
            allSources.push(newSource);
          }
        })
      }
      return allSources;
    }

  },
  mutations: {

    /*
    no need to sort here because these have already been sorted in the popup's
    store and here we simply retain a copy.
    */
    populate_follows: (state, sources) => {
      state.followedSources = sources;
    },
    populate_trusteds: (state, sources) => {
      state.trustedSources = sources;
    },
    populate_followers: (state, sources) => {
      state.followers = sources;
    }

  },
  actions: {
    fetchFollows: (context) => {

      return new Promise((resolve, reject) => {

        browser.runtime.sendMessage({
            type: 'get_follows'
        })
        .then(response => {
            context.commit('populate_follows', response);
            resolve();
        })
        .catch(err => {
          console.log(err)
          reject();
        })

      })
    },

    fetchTrusteds: (context) => {

      return new Promise((resolve, reject) => {

        browser.runtime.sendMessage({
            type: 'get_trusteds'
        })
        .then(response => {
            context.commit('populate_trusteds', response);
            resolve();
        })
        .catch(err => {
          console.log(err)
          reject();
        })
      })
    },

    fetchFollowers: (context) => {

      return new Promise((resolve, reject) => {

        browser.runtime.sendMessage({
            type: 'get_followers'
        })
        .then(response => {
            context.commit('populate_followers', response);
            resolve();
        })
        .catch(err => {
          console.log(err)
          reject();
        })
      })
    },

    addTrusted: (context, payload) => {

      return new Promise((resolve, reject) => {

        // relationServices.addTrusted(payload)
        // .then(response => {
        //   context.dispatch('fetchTrusteds')
        //   .then(()=> {
        //     resolve();
        //   })
        // })
        // .catch(err => {
        //   console.log(err)
        //   reject();
        // })
      })
    },

    deleteTrusted: (context, payload) => {

      return new Promise((resolve, reject) => {

        // relationServices.deleteTrusted(payload)
        // .then(response => {
        //   context.dispatch('fetchTrusteds')
        //   .then(() => {
        //     resolve();
        //   })
        // })
        // .catch(err => {
        //   console.log(err)
        //   reject();
        // })
      })
    },

    follow: (context, payload) => {

      return new Promise((resolve, reject) => {

        // relationServices.follow(payload)
        // .then(() => {
        //   context.dispatch('fetchFollows')
        //   .then(() => {
        //     resolve()
        //   })
        // })
        // .catch(err => {
        //   console.log(err)
        //   reject();
        // })
      });
    },

    unfollow: (context, payload) => {

      return new Promise((resolve, reject) => {

        // relationServices.unfollow(payload)
        // .then(() => {
        //   let dispatchProms = [
        //     context.dispatch('fetchFollows'),
        //     context.dispatch('fetchTrusteds')
        //   ];
        //   Promise.all(dispatchProms)
        //   .then(() => {
        //     resolve();
        //   })
        // })
        // .catch(err => {
        //   console.log(err);
        //   reject();
        // })
      })
    }

  }
}
