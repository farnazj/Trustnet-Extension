import sourceServices from '@/services/sourceServices'
import utils from '@/services/utils'

export default {
    namespaced: true,
    state: {
        isExpanded: false,
        assessments: {},
        userAssessment: {},
        historyVisibility: false,
        assessmentHistory: [],
        historyOwner: {}
    },
    getters: {
     
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
                browser.runtime.sendMessage({
                    type: 'get_assessments',
                    data: {
                        headers: { url: pageUrl }
                    }
                })
                .then((response) => {
                    context.dispatch('restructureAssessments', response)
                    .then((restructuredAssessments) => {
                        context.dispatch('sortAssessments', restructuredAssessments)
                        .then((sortedAssessments) => {
                            context.commit('set_assessments', sortedAssessments);

                            if (Object.values(sortedAssessments).flat().length)
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

                let assessments = {'confirmed': [], 'refuted': [], 'questioned': []};
                let assessmentsBySource = {};
            
                returnedAssessments.forEach(returnedAssessment => {
        
                    if (returnedAssessment.SourceId === null ) {
                        if (returnedAssessment.version == 1) {
                            let assessmentsObj = { lastVersion: returnedAssessment, assessor: {} };
                            let credValue = this.accuracyMapping(assessmentsObj.lastVersion.postCredibility);
                            assessments[credValue].push(assessmentsObj);
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
                            assessments[credValue].push(assessmentsObj);
                        })
                    );
                }
            
                Promise.all(sourcePromises)
                .then(() => {
                    resolve(assessments);
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

            let pageUrl = context.rootState.pageDetails.url;

            return new Promise((resolve, reject) => {

                browser.runtime.sendMessage({
                    type: 'get_assessments',
                    data: {
                        headers: { 
                            url: pageUrl,
                            authuser: true
                        }
                    }
                })
                .then(response => {
                    console.log('auth user post assessments', response)
                    
                    let assessment = response.length ? (response.filter(el => el.version == 1))[0] : {};
                    console.log('chosen assessment', assessment)
                    context.commit('set_user_assessment', assessment);
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
  