import domHelpers from "@/lib/domHelpers";
import utils from '@/services/utils'

export default {
    namespaced: true,
    state: {
        linksAssessments: {}
    },
    getters: {
        
        isConfirmed: (state, getters, rootState, rootGetters) => (link) => {

            let assessments = state.linksAssessments[link];
            let authUserId = rootGetters['auth/user'].id;
            let trustedIds = rootGetters['relatedSources/trustedIds'].concat(authUserId);

            return assessments['confirmed'].map(assessment => assessment.SourceId).filter(sourceId => 
                trustedIds.includes(sourceId)).length &&
            !(assessments['refuted'].map(assessment => assessment.SourceId).filter(sourceId => 
                trustedIds.includes(sourceId) ).length);
        },
        isRefuted: (state, getters, rootState, rootGetters) => (link) =>  {
            let assessments = state.linksAssessments[link];
            let authUserId = rootGetters['auth/user'].id;
            let trustedIds = rootGetters['relatedSources/trustedIds'].concat(authUserId);

            return !(assessments['confirmed'].map(assessment => assessment.SourceId).filter(sourceId => 
                trustedIds.includes(sourceId)).length) &&
            assessments['refuted'].map(assessment => assessment.SourceId).filter(sourceId => 
                trustedIds.includes(sourceId) ).length;
        },
        isDebated: (state, getters, rootState, rootGetters) => (link) => {
            let assessments = state.linksAssessments[link];
            let authUserId = rootGetters['auth/user'].id;
            let trustedIds = rootGetters['relatedSources/trustedIds'].concat(authUserId);

            return assessments['confirmed'].map(assessment => assessment.SourceId).filter(sourceId => 
                trustedIds.includes(sourceId)).length &&
            assessments['refuted'].map(assessment => assessment.SourceId).filter(sourceId => 
                trustedIds.includes(sourceId) ).length;
        },
        isQuestioned: (state) => (link) => {
            let assessments = state.linksAssessments[link];
            return assessments['questioned'].length > 0;
        }
    },
    mutations: {
         /*
        As a result of more elements being added to the page (e.g., while infinite scrolling), elements
        could be added that have the same links as the links that are already on the page (either in raw
        form or when sanitized). The assessments of these repeated links are fetched (under some occasions
        explained in the comments in the actions) whenever they are encountered again and the old assessments
        associated with these links are updated to what is returned most recently. 
        */
        update_links_assessments(state, linksAssessments) {
            let oldLinksToRemain = Object.keys(state.linksAssessments).filter(key => !Object.keys(linksAssessments).includes(key));
            const preservedLinksAssessments = Object.keys(state.linksAssessments)
            .filter(key => oldLinksToRemain.includes(key))
            .reduce((obj, key) => {
                obj[key] = state.linksAssessments[key];
                return obj;
            }, {});
            state.linksAssessments = Object.assign({}, preservedLinksAssessments, linksAssessments)
        },
        clear_links_assessments(state) {
            state.linkAssessments = {};
        }
    },
    actions: {
       
        getAssessmentsForLinks: (context) => {
            console.log('mire ke ejra she alan')
            return new Promise((resolve, reject) => {
               
                let previousLinksFoundOnPage = Object.keys(context.state.linksAssessments);
            
                let links = Array.from(new Set([...document.querySelectorAll('a')].map(el => 
                    el.getAttribute('href')).filter(el => el && !['/', '#'].includes(el)).filter(el => 
                        !previousLinksFoundOnPage.includes(el)
                    )));

                console.log('links chi peida kard', links)
                    
                let sanitizedLinks = links.map(url => {
                        let sanitizedUrl = url;
                        if (url[0] == '/' || url[0] == '?' || url[0] == '#')
                            sanitizedUrl = window.location.protocol + '//' + window.location.host + url;
                        
                        return utils.extractHostname(sanitizedUrl, false);
                });

                let allLinksProms = []; 
                let allLinksAssessments = {}
                let uniqueSanitizedLinksVisited = Array.from(new Set(sanitizedLinks)).reduce((obj, x) => 
                    Object.assign(obj, { [x]: 0 }), {});

                for (let i = 0 ; i < sanitizedLinks.length ; i += 20) {
                    let linksFragment = sanitizedLinks.slice(i, i + 20);

                    let linksFragmentUnvisited = linksFragment.filter((link) => {
                        if (uniqueSanitizedLinksVisited[link] == 0 ) {
                            uniqueSanitizedLinksVisited[link] = 1;
                            return true;
                        }
                        else
                            return false;
                    })
                    console.log('unvisited', linksFragmentUnvisited)

                    allLinksProms.push(Promise.all([
                        browser.runtime.sendMessage({
                            type: 'get_assessments',
                            data: {
                                headers: { 
                                    urls: JSON.stringify(linksFragmentUnvisited),
                                    excludeposter: true
                                }
                            }
                        }),
                        browser.runtime.sendMessage({
                            type: 'get_questions',
                            data: {
                                headers: { urls: JSON.stringify(linksFragmentUnvisited) }
                            }
                        })
                    ])
                    .then(([postsWAssessments, postsWQuestions]) => {
                        console.log('things returned from the server', postsWQuestions, postsWAssessments)
                        return context.dispatch('restructureAssessments', { 
                            postsWAssessments: postsWAssessments,
                            postsWQuestions: postsWQuestions,
                            sanitizedLinks: sanitizedLinks,
                            originalLinks: links
                         })
                    })
                    .then((restructuredAssessments) => {
                        allLinksAssessments = Object.assign(allLinksAssessments, restructuredAssessments);
                        console.log('inja chi bargardund ******', restructuredAssessments)
                        console.log('hala kollesh chi shode ta alan', JSON.stringify(allLinksAssessments))
                    })
                    .catch(err => {
                        console.log(err)
                        reject();
                    })
                    )
                }

                Promise.all(allLinksProms)
                .then(() => {
                    console.log('alan ejra shod wth', allLinksAssessments, JSON.stringify(allLinksAssessments))
                    context.commit('update_links_assessments', allLinksAssessments);
                    domHelpers.populateLinkAssessments(allLinksAssessments)
                    resolve();
                })

            })
                
        },

        restructureAssessments: (context, data) => {
            let postsWAssessments =  data.postsWAssessments;
            let postsWQuestions = data.postsWQuestions;
            let sanitizedLinks = data.sanitizedLinks;
            let originalLinks = data.originalLinks;

            return new Promise((resolve, reject) => {

                let linkAssessments = {};
                
                postsWAssessments.forEach((post) => {
                    if (post.PostAssessments.length) {
                        post.PostAssessments.forEach(assessment => {
                            if (assessment.version == 1) {
                                let credValue = utils.getAccuracyMapping(assessment.postCredibility);
                                
                                //get all indices of post.url in sanitizedLinks
                                //get the links in originalLinks
                                let originalLinkIndices = [];
                                let sanitizedLinkIndex = -1;

                                do {
                                    sanitizedLinkIndex = sanitizedLinks.indexOf(post.url, sanitizedLinkIndex + 1);
                                    if (sanitizedLinkIndex != -1)
                                        originalLinkIndices.push(sanitizedLinkIndex);
                                }
                                while (sanitizedLinkIndex != -1);
                                
                                originalLinkIndices.forEach((index) => {
                                    let originalLink = originalLinks[index];
                                    if (!(originalLink in linkAssessments))
                                        linkAssessments[originalLink] = {'confirmed': [], 'refuted': [], 'questioned': []};

                                    linkAssessments[originalLink][credValue].push(assessment);
                                })

                            }
                        })
                    }
                })

                postsWQuestions.forEach(post => {

                    if (post.PostAssessments.length) {

                        post.PostAssessments.forEach(question => {
                            let originalLinkIndices = [];
                            let sanitizedLinkIndex = -1;

                            do {
                                sanitizedLinkIndex = sanitizedLinks.indexOf(post.url, sanitizedLinkIndex + 1);
                                if (sanitizedLinkIndex != -1)
                                    originalLinkIndices.push(sanitizedLinkIndex);
                            }
                            while (sanitizedLinkIndex != -1);
                            
                            originalLinkIndices.forEach((index) => {
                                let originalLink = originalLinks[index];
                                if (!(originalLink in linkAssessments))
                                    linkAssessments[originalLink] = {'confirmed': [], 'refuted': [], 'questioned': []};

                                linkAssessments[originalLink]['questioned'].push(question);

                            })
                        })
                    }
                })
        
                resolve(linkAssessments);
            })
        },

        clearAssessments: (context) => {
            return new Promise((resolve, reject) => {
                context.commit('clear_links_assessments');
                resolve();
            })
        }

    }
  }
  