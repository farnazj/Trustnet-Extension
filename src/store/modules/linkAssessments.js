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
        
        isConfirmed: (state, getters, rootState, rootGetters) => (assessments) => {

            let authUserId = rootGetters['auth/user'].id;
            let trustedIds = rootGetters['relatedSources/trustedIds'].concat(authUserId);

            return assessments['confirmed'].map(assessment => assessment.SourceId).filter(sourceId => 
                trustedIds.includes(sourceId)).length &&
            !(assessments['refuted'].map(assessment => assessment.SourceId).filter(sourceId => 
                trustedIds.includes(sourceId) ).length);
        },
        isRefuted: (state, getters, rootState, rootGetters) => (assessments) =>  {
            let authUserId = rootGetters['auth/user'].id;
            let trustedIds = rootGetters['relatedSources/trustedIds'].concat(authUserId);

            return !(assessments['confirmed'].map(assessment => assessment.SourceId).filter(sourceId => 
                trustedIds.includes(sourceId)).length) &&
            assessments['refuted'].map(assessment => assessment.SourceId).filter(sourceId => 
                trustedIds.includes(sourceId) ).length;
        },
        isDebated: (state, getters, rootState, rootGetters) => (assessments) => {
            let authUserId = rootGetters['auth/user'].id;
            let trustedIds = rootGetters['relatedSources/trustedIds'].concat(authUserId);

            return assessments['confirmed'].map(assessment => assessment.SourceId).filter(sourceId => 
                trustedIds.includes(sourceId)).length &&
            assessments['refuted'].map(assessment => assessment.SourceId).filter(sourceId => 
                trustedIds.includes(sourceId) ).length;
        },
        isQuestioned: (state) => (assessments) => {
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

            console.log('commiting to the state', linksAssessments)
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

        setupLinkAssessments: (context) => {
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
                in their corresponding arrays-- links and sanitizedLinks).
                */
                let sanitizedLinks = links.map(url => {
                        let sanitizedUrl = url;
                        if (url[0] == '/' || url[0] == '?')
                            sanitizedUrl = window.location.protocol + '//' + window.location.host + url;
                        if (url[0] == '#')
                            sanitizedUrl = utils.extractHostname(window.location.href, false) + url;
                        
                        return utils.extractHostname(sanitizedUrl, false);
                });

                let allLinksProms = []; 
                let allLinksAssessments = {}
                /*
                Because sanitizedLinks can have duplicates (as explained above), an object of unique sanitizedLinks
                is created with each key being a sanitized link and its corresponding value a boolean indicating
                whether the link has been visited yet , with visited meaning its trail of redirects have been followed
                and its assessments have been fetched.
                */
                let uniqueSanitizedLinksVisited = Array.from(new Set(sanitizedLinks)).reduce((obj, x) => 
                    Object.assign(obj, { [x]: 0 }), {});

                console.log('uniqueSanitizedLinksVisited', Object.keys(uniqueSanitizedLinksVisited).length)

                /*
                The sanitized links can be redirects to other links. Therefore, they need to be followed and
                their corresponding target link fetched so that assessments can be requested on the target links.
                Their redirects are followed in batches of 20 at a time to prevent getting rate limited.
                For each batch, becase sanitizedLinks can have duplicates, we check to see if we have already
                visited the link by looking through uniqueSanitizedLinksVisited.
                */
                
                let allAxiosProms = []; //Promises related to fetching the trail of redirects for all the sanitized links
                let redirectedToSanitizedLinksMapping = {};
                let unavailableResources = [];

                for (let i = 0 ; i < sanitizedLinks.length ; i += 20) {

                    let iterationAxiosProms = []; //Promises related to fetching the trail of redirects for this iteration of sanitized links
                    let linksFragment = sanitizedLinks.slice(i, i + 20);

                    let linksFragmentUnvisited = linksFragment.filter((link) => {
                        if (uniqueSanitizedLinksVisited[link] == 0 ) {
                            uniqueSanitizedLinksVisited[link] = 1;
                            let iterationProm = utils.followRedirects(link).then((response) => {
                                console.log('javabesh', link, response, response.detail == 'CORS')
                                if (response.type == 'error') {
                                    if (response.detail == '404')
                                        unavailableResources.push(link);
                                }
                                if (response.type != 'error' || response.detail == 'CORS') {
                                    redirectedToSanitizedLinksMapping[utils.extractHostname(response.link)] = link;
                                }
                                    
                            });
                            iterationAxiosProms.push(iterationProm);
                            allAxiosProms.push(iterationProm);

                            return true;
                        }
                        else
                            return false;
                    })

                    /*
                    Once redirects for this batch of sanitized links are followed and fetched by the client,
                    assessments are requested for the target links from the server and the assessments are placed
                    on the DOM.
                    */
                    allLinksProms.push(
                        Promise.allSettled(iterationAxiosProms)
                        .then(() => {
                            context.dispatch('getAndShowAssessments', {
                                linksFragmentUnvisited: Object.keys(redirectedToSanitizedLinksMapping),
                                redirectedToSanitizedLinksMapping: redirectedToSanitizedLinksMapping,
                                sanitizedLinks: sanitizedLinks,
                                rawLinks: links
                            })
                            .then((restructuredAssessments) => {
                                allLinksAssessments = Object.assign(allLinksAssessments, restructuredAssessments);
                            })
                        })
                    )
                }

                /*
                Once the redirects for all the sanitized links have been followed by the client, we check to 
                see if there had been any that the client could not fetch (excluding those that were not available---
                returned a 404 error). We send those to the server so that it can follow their redirects and return
                the target links.
                */
                let linksForServerRedirect = [];
                Promise.allSettled(allAxiosProms)
                .then(() => {
                    let allSanitizedLinks = Object.keys(uniqueSanitizedLinksVisited);
                    let linksRedirectedByClient = Object.values(redirectedToSanitizedLinksMapping);

                    linksForServerRedirect = allSanitizedLinks.filter(link => !linksRedirectedByClient.includes(link) &&
                    !unavailableResources.includes(link));
                    console.log('sending links that the client was unable to retreive to the server', linksForServerRedirect);

                    /*
                    The links whose redirects are to be determined by the server (and then their assessments fetched)
                    are sent via get requests in batches of 20 because there is a limit on the size of the http header.
                    */
                    for (let i = 0 ; i < linksForServerRedirect.length ; i += 20) {
                        let linksFragment = linksForServerRedirect.slice(i, i + 20);
                        allLinksProms.push(
                            browser.runtime.sendMessage({
                                type: 'get_redirects',
                                data: {
                                    headers: { 
                                        urls: JSON.stringify(linksFragment)
                                    }
                                }
                            })
                            .then((urlMapping) => {
                            
                                console.log(urlMapping, 'url mapping from redirects returned from the server')

                                context.dispatch('getAndShowAssessments', {
                                    linksFragmentUnvisited: Object.keys(urlMapping),
                                    redirectedToSanitizedLinksMapping: urlMapping,
                                    sanitizedLinks: sanitizedLinks,
                                    rawLinks: links
                                })
                                .then((restructuredAssessments) => {
                                    allLinksAssessments = Object.assign(allLinksAssessments, restructuredAssessments);
                                })
                                
                            })
                        )
                    }
    
                    /*
                    Once the assessments for all the links have been fetched, they are committed to the state.
                    The links for which there have been no assessments or questions are also committed because
                    when the page encounters a mutation and therefore the looking for links and assessments is
                    performed again, we do not want to perform the same operations for the previously encountered
                    links (which could be numerous) again and again.
                    */
                    Promise.allSettled(allLinksProms)
                    .then(() => {
                        
                        links.forEach((link) => {
                            if (!(link in allLinksAssessments))
                                allLinksAssessments[link] = {'confirmed': [], 'refuted': [], 'questioned': []}
                        })

                        context.commit('update_links_assessments', allLinksAssessments);
                        context.dispatch('pageObserver/reconnectObserver', {}, { root: true });
    
                        resolve();
                    })
                })

          
            })
        },

        getAndShowAssessments: (context, data) => {

            return new Promise((resolve, reject) => {

                context.dispatch('fetchAssessmentsForLinks', data)
                .then((response) => {
                    return context.dispatch('restructureAssessments', {
                        postsWAssessments: response.postsWAssessments,
                        postsWQuestions: response.postsWQuestions,
                        sanitizedLinks: data.sanitizedLinks,
                        originalLinks: data.rawLinks,
                        urlMapping: data.redirectedToSanitizedLinksMapping
                    })
                })
                .then((restructuredAssessments) => {
                    console.log('What assessments this round of api calls returned', restructuredAssessments);
                    domHelpers.populateLinkAssessments(restructuredAssessments);
                    resolve(restructuredAssessments);
                })
            })
        },
       
        fetchAssessmentsForLinks: (context, data) => {

            let linksFragmentUnvisited = data.linksFragmentUnvisited;

            return new Promise((resolve, reject) => {
               
                /*
                for getting assessments of auth user's trusted and followed sources on the links
                */
                Promise.all([browser.runtime.sendMessage({
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
                })])
                .then(([postsWAssessments, postsWQuestions]) => {
                    console.log('assessments and questions returned from the server', postsWQuestions, postsWAssessments);
                    resolve({
                        postsWAssessments: postsWAssessments,
                        postsWQuestions: postsWQuestions
                    });
                })
            
                .catch(err => {
                    console.log(err)
                    reject();
                });

            })
                
        },

        restructureAssessments: (context, data) => {
            let postsWAssessments =  data.postsWAssessments;
            let postsWQuestions = data.postsWQuestions;
            let sanitizedLinks = data.sanitizedLinks;
            let originalLinks = data.originalLinks;
            let urlMapping = data.urlMapping;

            return new Promise((resolve, reject) => {

                let linkAssessments = {};
                
                postsWAssessments.forEach((post) => {
                    if (post.PostAssessments.length) {
                        post.PostAssessments.forEach(assessment => {
                            if (assessment.version == 1) {
       
                                let credValue = utils.getAccuracyMapping(assessment.postCredibility);
                                /*
                                get all indices of post.url in sanitizedLinks (because sanitizedLinks can have duplicates)
                                and using the indices, get their correponding raw links in the originalLinks array
                                */
                                let originalLinkIndices = [];
                                let sanitizedLinkIndex = -1;

                                let clientSanitizedUrl = urlMapping[post.url];
                                do {
                                    sanitizedLinkIndex = sanitizedLinks.indexOf(clientSanitizedUrl, sanitizedLinkIndex + 1);
                                    if (sanitizedLinkIndex != -1)
                                        originalLinkIndices.push(sanitizedLinkIndex);
                                }
                                while (sanitizedLinkIndex != -1);
                                
                                /*
                                Each instance of the raw links will be a key in linkAssessments mapped to its assessments
                                */
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

                            let clientSanitizedUrl = urlMapping[post.url];

                            do {
                                sanitizedLinkIndex = sanitizedLinks.indexOf(clientSanitizedUrl, sanitizedLinkIndex + 1);
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
  