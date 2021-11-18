import sourceServices from '@/services/sourceServices'
import utils from '@/services/utils'

export default {
    namespaced: true,
    state: {
        isExpanded: false,
        assessments: {'confirmed': [], 'refuted': [], 'questioned': []},
        userAssessment: {},
        historyVisibility: false,
        assessmentHistory: [],
        historyOwner: {}
    },
    getters: {
        
        isConfirmed: (state, getters, rootState, rootGetters) => {
            let authUserId = rootGetters['auth/user'].id;
            let trustedIds = rootGetters['relatedSources/trustedIds'].concat(authUserId);

            return state.assessments['confirmed'].map(assessment => assessment.assessor.id).filter(sourceId => 
                trustedIds.includes(sourceId)).length &&
            !(state.assessments['refuted'].map(assessment => assessment.assessor.id).filter(sourceId => 
                trustedIds.includes(sourceId)).length);
        },
        isRefuted: (state, getters, rootState, rootGetters) => {
            let authUserId = rootGetters['auth/user'].id;
            let trustedIds = rootGetters['relatedSources/trustedIds'].concat(authUserId);

            return !(state.assessments['confirmed'].map(assessment => assessment.assessor.id).filter(sourceId => 
                trustedIds.includes(sourceId)).length) &&
            state.assessments['refuted'].map(assessment => assessment.assessor.id).filter(sourceId => 
                trustedIds.includes(sourceId)).length;
        },
        isDebated: (state, getters, rootState, rootGetters) => {
            let authUserId = rootGetters['auth/user'].id;
            let trustedIds = rootGetters['relatedSources/trustedIds'].concat(authUserId);

            return state.assessments['confirmed'].map(assessment => assessment.assessor.id).filter(sourceId => 
                trustedIds.includes(sourceId)).length &&
            state.assessments['refuted'].map(assessment => assessment.assessor.id).filter(sourceId => 
                trustedIds.includes(sourceId)).length;
        },
        /*
        determines if there are assessments by a source other than the original poster of the article
        */
        isNoSourceAssessmentNonEmpty: function(state, getters, rootState, rootGetter) {
            if (rootState.pageDetails.article) {
                let articleSourceId = rootState.pageDetails.article.SourceId;
                let noSourceAssessments = Object.values(state.assessments).flat().filter(assessment =>
                     assessment.assessor.id != articleSourceId);
    
                return noSourceAssessments.length;
            }
            else
                return Object.values(state.assessments).flat().length;
            
        }
    },
    mutations: {
        set_visibility(state, visibility) {
            state.isExpanded = visibility;
        },
        set_assessments(state, assessments) {
            state.assessments = assessments;
        },
        set_user_assessment(state, assessment) {
            state.userAssessment = assessment;
        }
    },
    actions: {

        getAllAssessments: (context) => {
            return new Promise((resolve, reject) => {
            
                let pageUrl = context.rootState.pageDetails.url;

                Promise.all([browser.runtime.sendMessage({
                    type: 'get_assessments',
                    data: {
                        headers: { 
                            urls: JSON.stringify([pageUrl])
                            // excludeposter: true
                        }
                    }
                }),
                /*
                for getting questions posted by the people who trust the auth user and have either
                specified the auth user as an arbiter of a question or have specified no one
                */
                browser.runtime.sendMessage({
                    type: 'get_questions',
                    data: {
                        headers: { urls: JSON.stringify([pageUrl]) }
                    }
                })])
                .then(([postsWAssessments, postsWQuestions]) => {
                    let returnedAssessments = postsWAssessments.length ? postsWAssessments[0].PostAssessments : [];
                    let returnedQuestions = postsWQuestions.length ? postsWQuestions[0].PostAssessments : [];

                    returnedAssessments = returnedAssessments.concat(returnedQuestions)
                    context.dispatch('restructureAssessments', returnedAssessments)
                    .then((restructuredAssessments) => {
                        context.dispatch('sortAssessments', restructuredAssessments)
                        .then((sortedAssessments) => {
                            context.commit('set_assessments', sortedAssessments);

                            if (context.rootGetters['assessments/isNoSourceAssessmentNonEmpty'])
                                context.commit('set_visibility', true);

                            resolve();
                        })
                    })
                })
                .catch(err => {
                    console.log(err)
                    reject();
                })
            })
        },

        restructureAssessments: (context, returnedAssessments) => {
            
            return new Promise((resolve, reject) => {

                let tmpAssessments = {'confirmed': [], 'refuted': [], 'questioned': []};
                let assessmentsBySource = {};
            
                returnedAssessments.forEach(returnedAssessment => {
        
                    if (returnedAssessment.SourceId === null ) {
                        if (returnedAssessment.version == 1) {
                            let assessmentsObj = { lastVersion: returnedAssessment, assessor: {} };
                            let credValue = utils.getAccuracyMapping(assessmentsObj.lastVersion.postCredibility);
                            tmpAssessments[credValue].push(assessmentsObj);
                        }
                    }
                    else {
                        if (!(returnedAssessment.SourceId in assessmentsBySource)) {
                            let assessmentsObj = {};
                            assessmentsObj['history'] = [];
                            assessmentsBySource[returnedAssessment.SourceId] = assessmentsObj;
                        }
            
                        if (returnedAssessment.version == 1)
                            assessmentsBySource[returnedAssessment.SourceId]['lastVersion'] = returnedAssessment;
                        else
                            assessmentsBySource[returnedAssessment.SourceId]['history'].push(returnedAssessment);
                    }
        
                })
        
                let sourcePromises = [];
            
                for (const [SourceId, assessmentsObj] of Object.entries(assessmentsBySource)) {
                    let credValue = utils.getAccuracyMapping(assessmentsObj.lastVersion.postCredibility);
                    sourcePromises.push(
                        sourceServices.getSourceById(SourceId)
                        .then(response => {
                            assessmentsBySource[SourceId]['assessor'] = response.data;
                            tmpAssessments[credValue].push(assessmentsObj);
                        })
                    );
                }
            
                Promise.all(sourcePromises)
                .then(() => {
                    resolve(tmpAssessments);
                })
            })
        },

        sortAssessments: (context, assessments)  => {
            return new Promise((resolve, reject) => {
                let sortedAssessments = {};

                for (const [key, value] of Object.entries(assessments)) {
                    sortedAssessments[key] = assessments[key].slice().sort(utils.compareAssessments);
                }
                resolve(sortedAssessments);
            })
        },

        getAuthUserPostAssessment: (context) => {

            console.log('going to get auth user assessments');
            console.time('authUserStart');
            console.timeLog('authUserStart')
            let pageUrl = context.rootState.pageDetails.url;

            return new Promise((resolve, reject) => {

                browser.runtime.sendMessage({
                    type: 'get_assessments',
                    data: {
                        headers: { 
                            urls: JSON.stringify([pageUrl])
                        }
                    }
                })
                .then(response => {
                    let assessment = response.length ? (response[0].PostAssessments.filter(el => el.version == 1))[0] : {};
                    context.commit('set_user_assessment', assessment);
                    console.timeEnd('authUserStart');

                    if (Object.entries(assessment).length && !context.rootState.pageDetails.articleId)
                        context.dispatch('pageDetails/getArticleByUrl', true , {root: true} )
                        .then(() => {
                            resolve();
                        })
                    else
                        resolve();
                })
                .catch(err => {
                    reject(err);
                })
            })
        },
      
        postAuthUserAssessment: (context, payload) => {
    
            let pageUrl = context.rootState.pageDetails.url;
            return new Promise((resolve, reject) => {
                browser.runtime.sendMessage({
                    type: 'post_assessment',
                    data: {
                        reqBody: { 
                            url: pageUrl,
                            ...payload
                        }
                    }
                })
                .then(() => {
                    resolve();
                })
                .catch(err => {
                    reject(err);
                })
            })
        },

        setVisibility: (context, payload) => {
            context.commit('set_visibility', payload);
        },
      
        setHistoryVisibility: (context, payload) => {
            context.commit('set_history_visibility', payload);
        },

        populateAssessmentHistory: (context, payload) => {
            context.commit('populate_assessment_history', payload);
        }   
    }
  }
  