
export default {
  namespaced: true,
  state: {
    counter: 0
  },
  getters: {


  },
  mutations: {

    increment_counter(state){
      state.counter = state.counter + 1;
    },

   
  },
  actions: {
    incrementCounter: (context) => {

      return new Promise((resolve, reject) => {

        context.commit('increment_counter');
        resolve();
     
      })
    },

   

  }
}
