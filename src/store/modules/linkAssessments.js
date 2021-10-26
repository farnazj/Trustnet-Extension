import domHelpers from "@/lib/domHelpers";
import utils from '@/services/utils'

/*
This module is for fetching assessments and accuracy questions of all the links
found on the current page.
*/
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
                /*
                Get all the links on the page that in their raw form aren't exactly the same as the links
                for which we have already obtained assessments (we already have asessments for some links
                e.g., in the case that we are loading more links into the page). This means that even if 
                there are newer assessments for such links, they will not get updated.
                */
                let links = Array.from(new Set([...document.querySelectorAll('a')].map(el => 
                    el.getAttribute('href')).filter(el => el && !['/', '#'].includes(el)).filter(el => 
                        !previousLinksFoundOnPage.includes(el)
                    )));

                console.log('raw links found', links)
                
                /*
                Link sanitization. Relative links are made absolute by adding the protocol and the host name,
                and the query parameters are stripped off (unless the first query parameters on certain websites
                that distinguish a resource using query parameters)
                After sanitization, some links may end up being the same. These are not filtered however, because
                we want to know which raw link a sanitized link pertains to (they will both share the same index
                in their corresponding arrays).
                */
                let sanitizedLinks = links.map(url => {
                        let sanitizedUrl = url;
                        if (url[0] == '/' || url[0] == '?' || url[0] == '#')
                            sanitizedUrl = window.location.protocol + '//' + window.location.host + url;
                        
                        return utils.extractHostname(sanitizedUrl, true);
                });

                let allLinksProms = []; 
                let allLinksAssessments = {}
                let uniqueSanitizedLinksVisited = Array.from(new Set(sanitizedLinks)).reduce((obj, x) => 
                    Object.assign(obj, { [x]: 0 }), {});

                /*
                All links are not sent to the server at once because these will be part of the http header
                and there is a limit on the size of the header that can be sent. Therefore, they are sent
                in batches of 20 at a time. For each batch, becase sanitizedLinks can have duplicates, we
                check to see if we have already requested the assessments of the link by looking through 
                uniqueSanitizedLinksVisited. If we haven't, we send the request.
                */
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
                    console.log('unvisited sanitized links so far', linksFragmentUnvisited);

                    allLinksProms.push(Promise.all([
                        /*
                        for getting assessments of auth user's trusted and followed sources on the links
                        */
                        browser.runtime.sendMessage({
                            type: 'get_assessments',
                            data: {
                                headers: { 
                                    urls: JSON.stringify(linksFragmentUnvisited),
                                    excludeposter: true
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
                                headers: { urls: JSON.stringify(linksFragmentUnvisited) }
                            }
                        })
                    ])
                    .then(([postsWAssessments, postsWQuestions]) => {
                        console.log('assessments and questions returned from the server', postsWQuestions, postsWAssessments);
                        return context.dispatch('restructureAssessments', { 
                            postsWAssessments: postsWAssessments,
                            postsWQuestions: postsWQuestions,
                            sanitizedLinks: sanitizedLinks,
                            originalLinks: links
                         })
                    })
                    .then((restructuredAssessments) => {
                        allLinksAssessments = Object.assign(allLinksAssessments, restructuredAssessments);
                        console.log('What assessments this round of api calls returned', restructuredAssessments);
                    })
                    .catch(err => {
                        console.log(err)
                        reject();
                    })
                    )
                }

                Promise.all(allLinksProms)
                .then(() => {
                    context.commit('update_links_assessments', allLinksAssessments);
                    domHelpers.populateLinkAssessments(allLinksAssessments);
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
                                
                                /*
                                get all indices of post.url in sanitizedLinks and using the indices, get their
                                correponding raw links in the originalLinks array
                                */
                                let originalLinkIndices = [];
                                let sanitizedLinkIndex = -1;

                                let urlWOProtocol = post.url.substring(post.url.indexOf('//') + 2);

                                do {
                                    sanitizedLinkIndex = sanitizedLinks.indexOf(urlWOProtocol, sanitizedLinkIndex + 1);
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

                            let urlWOProtocol = post.url.substring(post.url.indexOf('//') + 2);

                            do {
                                sanitizedLinkIndex = sanitizedLinks.indexOf(urlWOProtocol, sanitizedLinkIndex + 1);
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
  