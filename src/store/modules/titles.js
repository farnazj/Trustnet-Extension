import Vue from 'vue'
import utils from '@/lib/utils'
import domHelpers from '@/lib/domHelpers'
import consts from '@/lib/constants'

export default {
  namespaced: true,
  state() {
    return {
      titles: [],
      titlesDialogVisible: false,
      historyVisiblity: false,
      titleHistory: [],
      historyOwner: {},
      titlesFetched: false
    }
  },
  mutations: {
    set_titles_dialog_visibility: (state, visibility) => {
        state.titlesDialogVisible = visibility;
    },

    populate_titles: (state, titles) => {
        let replaceMode = false;
  
        if (titles.length == 1) {
          
          let index = state.titles.findIndex(title => title.id == titles[0].id);
          if (index !== -1 ) {
            Vue.set(state.titles, index, titles[0]);
            replaceMode = true;
          }
        }
        
        if (!replaceMode)
          state.titles.push(...titles);
    },

    set_titles_fetched_status: (state, payload) => {
        state.titlesFetched = payload;
    } 
  },
  actions: {
    hashPageContent: (context, payload) => {
        return new Promise((resolve, reject) => {
        
            let content = payload.content;
            let allHashes = [];
            let contentArr = content.split(/\r\n|\r|\n|\t/);
            contentArr.forEach( (str) => {
                if (str.length >= consts.LENGTH_TO_HASH) {
                    for (let i = 0 ; i < str.length ; i++) {
                        let strPortion = str.substr(i, consts.LENGTH_TO_HASH);
            
                        if (strPortion.length >= consts.LENGTH_TO_HASH) {     
                            allHashes.push(utils.hashCode(utils.uncurlify(strPortion)));
                        }
                    }
                }
            })
    
            console.log(allHashes)
            resolve(allHashes);
        })
    },

    getTitleMatches: (context, payload) => {
        return new Promise((resolve, reject) => {
  
          browser.runtime.sendMessage({
              type: 'get_title_hash_matches',
              data: payload
          })
          .then(resp => {
              let candidateTitles = resp;
              resolve(candidateTitles);
          })
          .catch(err => {
            console.log(err)
            reject();
          })
        })
    },

    arrangeCustomTitles: (context, payload) => {
        return new Promise((resolve, reject) => {
          browser.runtime.sendMessage({
              type: 'arrange_custom_titles',
              data: payload.resTitles
          })
          .then(resp => {
              resolve(resp);
          })
          .catch(err => {
            console.log(err)
            reject();
          })
  
        })
     
    },

    sortCustomTitles: (context, payload) => {
        return new Promise((resolve, reject) => {
          
          let standaloneTitlesArr = payload;
          let allProms = [];
  
          standaloneTitlesArr.forEach((candidateTitle, index) => {
            if (typeof candidateTitle.StandaloneCustomTitles !== 'undefined') {
                allProms.push(context.dispatch('arrangeCustomTitles', { 
                  resTitles: candidateTitle.StandaloneCustomTitles
                })
                .then(customTitleObjects => {
                    standaloneTitlesArr[index].sortedCustomTitles = customTitleObjects.slice().sort(utils.compareTitles);
                }))
            }
          })
  
          if (allProms.length) {
            Promise.all(allProms)
            .then(() => {
                resolve(standaloneTitlesArr);
            })
          }
          else
            resolve([]);
          
        })
    },

    findTitlesOnPage: (context, payload) => {
        return new Promise((resolve, reject) => {
  
            let candidateTitles = payload.candidateTitlesWSortedCustomTitles;
    
            let allProms = [];
            let titlesFoundOnPage = [];
            candidateTitles.forEach(candidateTitle => {
            let replacementCount = domHelpers.findAndReplaceTitle(candidateTitle)
            if (replacementCount)
                titlesFoundOnPage.push(candidateTitle);
            })
    
            console.log(titlesFoundOnPage, 'titles found on page')
            Promise.all(allProms)
            .then(() => {
                context.commit('populate_titles', titlesFoundOnPage);
                
                domHelpers.identifyPotentialTitles();
                resolve();
            })
    
        })
    },
  

    setUpTitles: (context, payload) => {
        return new Promise((resolve, reject) => {
  
          let docInnerText = document.body.innerText;
  
          context.dispatch('hashPageContent', {content: docInnerText})
          .then( allHashes => {
              context.dispatch('getTitleMatches', { titlehashes: allHashes })
                .then(candidateTitles => {
                    context.dispatch('sortCustomTitles', candidateTitles)
                    .then(standaloneTitlesArr => {
                        context.dispatch('findTitlesOnPage', { candidateTitlesWSortedCustomTitles: standaloneTitlesArr })
                        .then(res => {
                        resolve();
                        })
                    })
              
              })
          })
        
        })
    },

    setTitlesFetched: (context, payload) => {
        return new Promise((resolve, reject) => {
          context.commit('set_titles_fetched_status', payload);
          resolve();
        })
    },

    setTitlesDialogVisibility: (context, payload) => {
        context.commit('set_titles_dialog_visibility', payload);
    }
  
  }
}