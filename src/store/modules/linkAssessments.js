import domHelpers from "@/lib/domHelpers";
import utils from '@/services/utils'
import { mdiConsoleLine } from "@mdi/js";

/*
This module is for fetching assessments and accuracy questions of all the links
found on the current page.
*/
export default {
    namespaced: true,
    state: {
        linksAssessments: {},
        nonEmptyLinkAssessments: {}
    },
    getters: {

        linkAssessmentsBySources: (state, getters, rootState, rootGetters) => 
            (assessments, accuracyStatus, sources) => {
            let authUserId = rootGetters['auth/user'].id;

            let sourcesIds;
            if (sources == 'trusted')
                sourcesIds = rootGetters['relatedSources/trustedIds'].concat(authUserId);
            else if (sources == 'followed')
                sourcesIds = rootGetters['relatedSources/followedIds'].concat(authUserId);

            return assessments[accuracyStatus].map(assessment => assessment.SourceId).filter(sourceId => 
                sourcesIds.includes(sourceId));
        },
        
        isConfirmed: (state, getters) => (assessments) => {

            let confirmedByTrusted = getters.linkAssessmentsBySources(assessments, 'confirmed', 'trusted');
            let refutedByTrusted = getters.linkAssessmentsBySources(assessments, 'refuted', 'trusted');

            if (confirmedByTrusted.length || refutedByTrusted.length)
                return confirmedByTrusted.length && !(refutedByTrusted.length);
            else {
                let confirmedByFollowed = getters.linkAssessmentsBySources(assessments, 'confirmed', 'followed');
                let refutedByFollowed = getters.linkAssessmentsBySources(assessments, 'refuted', 'followed');
                return confirmedByFollowed.length && !(refutedByFollowed.length);
            }
        },
        isRefuted: (state, getters) => (assessments) =>  {
            let confirmedByTrusted = getters.linkAssessmentsBySources(assessments, 'confirmed', 'trusted');
            let refutedByTrusted = getters.linkAssessmentsBySources(assessments, 'refuted', 'trusted');

            if (confirmedByTrusted.length || refutedByTrusted.length) {
                return !(confirmedByTrusted.length) && refutedByTrusted.length;
            }
            else {
                let confirmedByFollowed = getters.linkAssessmentsBySources(assessments, 'confirmed', 'followed');
                let refutedByFollowed = getters.linkAssessmentsBySources(assessments, 'refuted', 'followed');
                return !(confirmedByFollowed.length) && refutedByFollowed.length;
            }
        },
        isDebated: (state, getters) => (assessments) => {
            let confirmedByTrusted = getters.linkAssessmentsBySources(assessments, 'confirmed', 'trusted');
            let refutedByTrusted = getters.linkAssessmentsBySources(assessments, 'refuted', 'trusted');

            if (confirmedByTrusted.length || refutedByTrusted.length) {
                return confirmedByTrusted.length && refutedByTrusted.length;
            }
            else {
                let confirmedByFollowed = getters.linkAssessmentsBySources(assessments, 'confirmed', 'followed');
                let refutedByFollowed = getters.linkAssessmentsBySources(assessments, 'refuted', 'followed');
                return confirmedByFollowed.length && refutedByFollowed.length;
            }
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

            let oldLinksToRemain = Object.keys(state.linksAssessments).filter(key => !Object.keys(linksAssessments).includes(key));
            const preservedLinksAssessments = Object.keys(state.linksAssessments)
            .filter(key => oldLinksToRemain.includes(key))
            .reduce((obj, key) => {
                obj[key] = state.linksAssessments[key];
                return obj;
            }, {});
            state.linksAssessments = Object.assign({}, preservedLinksAssessments, linksAssessments);


            let nonEmptyLinkAssessments = Object.fromEntries(Object.entries(linksAssessments).filter(([key, val]) => 
                val.confirmed.length || val.refuted.length || val.questioned.length
            ));

            let nonEmptyOldLinksToRemain = Object.keys(state.nonEmptyLinkAssessments).filter(key => !Object.keys(nonEmptyLinkAssessments).includes(key));
            const nonEmptyPreservedLinksAssessments = Object.keys(state.nonEmptyLinkAssessments)
            .filter(key => nonEmptyOldLinksToRemain.includes(key))
            .reduce((obj, key) => {
                obj[key] = state.nonEmptyLinkAssessments[key];
                return obj;
            }, {});
            state.nonEmptyLinkAssessments = Object.assign({}, nonEmptyPreservedLinksAssessments, nonEmptyLinkAssessments);

        },
        clear_links_assessments(state) {
            state.linkAssessments = {};
            state.nonEmptyLinkAssessments = {};
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
                    el.getAttribute('href')).filter(el => el && !['/', '#'].includes(el) && el.substring(0, 7) != 'mailto:' ).filter(el => 
                        !previousLinksFoundOnPage.includes(el)
                    )));

                console.log('raw links found', links)

                if (links.includes('/2021/11/30/politics/dr-oz-senate-campaign-pennsylvania/index.html'))
                        console.log('peida shod?\n')

                /*
                Links that are newly added to the page but for which we already have fetched assessments
                */
                let prevNonEmptyLinks = Object.keys(context.state.nonEmptyLinkAssessments);
                let newRepeatedLinks = Array.from(new Set([...document.querySelectorAll('a')].filter(el => 
                    !el.getAttribute('trustnet-modified-question-link') && 
                    !el.getAttribute('trustnet-modified-link')
                    ).map(el => 
                    el.getAttribute('href')).filter(el => el && !['/', '#'].includes(el) && el.substring(0, 7) != 'mailto:' ).filter(el => 
                        prevNonEmptyLinks.includes(el)
                )));

                console.log('previous links w assessments found on page', prevNonEmptyLinks);
                console.log('new repeated links', newRepeatedLinks);
                newRepeatedLinks.forEach(link => {
                    domHelpers.populateLinkAssessments(context.state.nonEmptyLinkAssessments[link]);
                });
                
                /*
                Link sanitization. Relative links are made absolute by adding the protocol and the host name,
                and the query parameters are stripped off (unless the first query parameters on certain websites
                that distinguish a resource using query parameters)
                After sanitization, some links may end up being the same. These are not filtered however, because
                we want to know which raw link a sanitized link pertains to (they will both share the same index
                in their corresponding arrays-- links and sanitizedLinks).
                */
                let sanitizedLinks = links.map( (url, index) => {
                        let sanitizedUrl = url;
                        if (url[0] == '/' || url[0] == '?')
                            sanitizedUrl = window.location.protocol + '//' + window.location.host + url;
                        if (url[0] == '#')
                            sanitizedUrl = utils.extractHostname(window.location.href, false) + url;
    
                        return utils.extractHostname(sanitizedUrl, false);
                });

                //remove invalid urls both from sanitizedLinks and raw links arrays
                sanitizedLinks = sanitizedLinks.filter((url, index) => {
                    if (utils.isValidHttpUrl(url))
                        return true;
                    else {
                        console.lo
                        links.splice(index, 1);
                        return false;
                    }
                });
          
                let redirectedToSanitizedLinksMapping = {}; //for all the links found on the page
                let allLinksAssessments = {};
                /*
                Ask the server for mappings of sanitized links already stored on the server and get their assessments
                Throughout the code, the links whose redirects are to be determined by the server (and then their assessments
                fetched) are sent via get requests in batches of 20 because there is a limit on the size of the http header.
                */
                let mappingReqProms = [];
                let serverSentMappings = [];
                for (let j = 0 ; j < sanitizedLinks.length ; j += 20) {
                    let iterationRequestedLinks = sanitizedLinks.slice(j, j + 20);
                    
                    mappingReqProms.push(
                        browser.runtime.sendMessage({
                            type: 'get_redirects',
                            data: {
                                headers: { 
                                    urls: JSON.stringify(iterationRequestedLinks.filter(link => link))
                                }
                            }
                        })
                        .then((serverResponse) => {
                            serverSentMappings = serverSentMappings.concat(serverResponse);

                            let reFormattedMappings = {};
                            for (let i = 0 ; i < serverResponse.length; i++) {
                                if (serverResponse[i])
                                    reFormattedMappings[iterationRequestedLinks[i]] = serverResponse[i];
                            }                        
        
                            context.dispatch('getAndShowAssessments', {
                                linksFragmentUnvisited: Object.keys(reFormattedMappings),
                                redirectedToSanitizedLinksMapping: reFormattedMappings,
                                sanitizedLinks: sanitizedLinks,
                                rawLinks: links
                            })
                            .then((restructuredAssessments) => {
                                allLinksAssessments = Object.assign(allLinksAssessments, restructuredAssessments);
                            })
                            
                        })
                    );   
                }
                
                //find sanitized links that were not sent by the server and follow their chain of redirects
                Promise.all(mappingReqProms)
                .then( () => {
                    console.log('all server sent mappings are', serverSentMappings)
                    console.log('non-null server sent mappings', sanitizedLinks.filter((link, index) => 
                        serverSentMappings[index]
                    ))
                    //The remainder of those sanitized links for which the server did not have mappings to their ultimate links
                    
                    let sanitizedLinksRemainder = sanitizedLinks.filter((link, index) => 
                        !serverSentMappings[index]
                    ).filter(url => utils.isValidHttpUrl(url));

                    console.log(`The sanitized links for which the server does not have mappings`, sanitizedLinksRemainder)
                    redirectedToSanitizedLinksMapping = Object.assign(redirectedToSanitizedLinksMapping, serverSentMappings);
    
                    let allLinksProms = []; 
                    /*
                    Because sanitizedLinks can have duplicates (as explained above), an object of unique sanitizedLinks
                    is created with each key being a sanitized link and its corresponding value a boolean indicating
                    whether the link has been visited yet , with visited meaning its trail of redirects have been followed
                    and its assessments have been fetched.
                    */
                    let uniqueSanitizedLinksVisited = Array.from(new Set(sanitizedLinksRemainder)).reduce((obj, x) => 
                        Object.assign(obj, { [x]: 0 }), {});
    
                    /*
                    The sanitized links can be redirects to other links. Therefore, they need to be followed and
                    their corresponding target link fetched so that assessments can be requested on the target links.
                    Their redirects are followed in batches of 20 at a time to prevent getting rate limited.
                    For each batch, becase sanitizedLinksRemainder can have duplicates, we check to see if we have already
                    visited the link by looking through uniqueSanitizedLinksVisited.
                    */
                    
                    let allAxiosProms = []; //Promises related to fetching the trail of redirects for all the sanitized links
                    let unavailableResources = [];
                    let CORSBlockedLinks = [];
    
                    for (let i = 0 ; i < sanitizedLinksRemainder.length ; i += 20) {
    
                        let iterationAxiosProms = []; //Promises related to fetching the trail of redirects for this iteration of sanitized links
                        let iterationMappings = {};
                        let linksFragment = sanitizedLinksRemainder.slice(i, i + 20);
    
                        let linksFragmentUnvisited = linksFragment.filter((link) => {
                            if (uniqueSanitizedLinksVisited[link] == 0 ) {
                                uniqueSanitizedLinksVisited[link] = 1;
                                let iterationProm = utils.followRedirects(link).then((response) => {
                                    // console.log('results of client following redirect trail', link, response, response.detail == 'CORS')
                                    if (response.type == 'error') {
                                        if (response.detail == '404')
                                            unavailableResources.push(link);
                                        /*
                                        Even though on chasing the redirects of some links we may have encountered a CORS issue,
                                        we nevertheless add the mapping of the redirected response to the original link. This mapping
                                        may or may not be final. For example, in the case of WashingtonPost articles, when we encounter
                                        a CORS issue, we already have the final URL. However, in the case of links to BBC or NYT on Facebook, 
                                        because the links are shortened, we still do not have the final link when we encounter the CORS issue.
                                        All of these CORS blocked links will be later sent to the server so that the server can find the
                                        ultimate target link. We keep the mapping here nonetheless, because for paywalled articles, the 
                                        server may not be able to get the redirected links (and rather get 403 for example).
                                        */
                                        if (response.detail == 'CORS') {
                                            iterationMappings[utils.extractHostname(response.link)] = link;
                                            CORSBlockedLinks.push(link);
                                        }
                                        if (response.detail == 'Unknown')
                                            CORSBlockedLinks.push(link);
                                    }
                                    if (response.type != 'error')  {
                                        iterationMappings[utils.extractHostname(response.link)] = link;
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
                                redirectedToSanitizedLinksMapping = Object.assign(redirectedToSanitizedLinksMapping, iterationMappings);

                                context.dispatch('getAndShowAssessments', {
                                    linksFragmentUnvisited: Object.keys(iterationMappings),
                                    redirectedToSanitizedLinksMapping: iterationMappings,
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
                    Inform the server of the redirects that it did not know about so that it can store them.
                    These mappings include redirectedToSanitizedLinksMapping but not the CORSBlockedLinks (since
                    they will be explicitly followed by the server later and then stored) and the initial links need
                    to be in sanitizedLinksRemainder (since sanitizedLinksRemainder is filtered to only include the links whose mapping
                    the server did not know)
                    */
                    Promise.allSettled(allAxiosProms)
                    .then(() => {

                        let mappingsToStore = Object.fromEntries(Object.entries(redirectedToSanitizedLinksMapping).filter( ([originLink, targetLink]) => 
                            !CORSBlockedLinks.includes(originLink) && sanitizedLinksRemainder.includes(originLink)));

                        console.log('url mappings to send to the server for storage after all the redirection followings', mappingsToStore);

                        if (mappingsToStore.length) {
                            browser.runtime.sendMessage({
                                type: 'send_redirects',
                                data: {
                                    reqBody: { 
                                        urlMappings: JSON.stringify(mappingsToStore)
                                    }
                                }
                            })
                            .then(resp => {
                                console.log('posted redirects to the server', resp)
                            });
    
                        }
                        
                        console.log('sending links that the client was unable to retrieve to the server', CORSBlockedLinks);
                   
                        /*
                        Once the redirects for all the sanitized links have been followed by the client, we send those
                        that the client could not check because of CORS issues to the server so that it can follow their redirects and return
                        the target links.
                        */
                        for (let i = 0 ; i < CORSBlockedLinks.length ; i += 20) {
                            let linksFragment = CORSBlockedLinks.slice(i, i + 20);
                            allLinksProms.push(
                                browser.runtime.sendMessage({
                                    type: 'follow_redirects',
                                    data: {
                                        headers: { 
                                            urls: JSON.stringify(linksFragment)
                                        }
                                    }
                                })
                                .then((urlMapping) => {
                                    
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
  