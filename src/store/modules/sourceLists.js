import sourceListServices from '@/services/sourceListServices'

export default {
  namespaced: true,
  state: {
    sourceLists: []
  },
  getters: {
    isSourceInList: (state) => {

      return (listId, sourceId) => {

        let listIndex = state.sourceLists.findIndex(sourceList => sourceList.id == listId);
        let sourceIndex = state.sourceLists[listIndex].ListEntities.findIndex(source =>
          source.id == sourceId);
        if (sourceIndex == -1)
          return false;
        return true;
      }
    }
  },
  mutations: {
    set_lists: (state, lists) => {
      state.sourceLists = lists;
    }
  },
  actions: {
    fetchLists: function(context) {

      return new Promise((resolve, reject) => {

        browser.runtime.sendMessage({
          type: 'get_lists'
        })
        .then(response => {
          context.commit('set_lists', response);
          resolve();
        })
        .catch(err => {
          reject(err);
        })
      })
    }

  }
}
