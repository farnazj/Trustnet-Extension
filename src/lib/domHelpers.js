import utils from '@/lib/utils'
import insertedAppRouter from '@/router'

function getElementsContainingText(text) {

    let xpath, query;
    let uncurlifiedText = utils.uncurlify(text);

    let results = [];

    try {
        xpath = `//*[contains(text(), "${text}") or contains(text(), "${uncurlifiedText}")]`;
        query = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);    
    }
    catch (error) {
        console.log('error khord', error)
        if (error.name == 'DOMException') {
            xpath = `//*[contains(text(), '${text}') or contains(text(), '${uncurlifiedText}')]`;
            query = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);  
        }
    }
        
    for (let i = 0, length = query.snapshotLength; i < length; ++i) {
        results.push(query.snapshotItem(i));
    }

    return results;
}

function addAltTitleNodeToHeadline(altTitle) {
    const newEl = document.createElement('em');
    newEl.classList.add('new-alt-headline', `title-${altTitle.id}`);
    newEl.addEventListener('click', function(ev) {
        ev.preventDefault();

    insertedAppRouter.push({
        name: 'customTitles',
        params: { 
            titleId: altTitle.id
        }
    })

        // browser.runtime.sendMessage({
        //     type: 'direct_to_custom_titles',
        //     data: {
        //         titleId: altTitle.id
        //     }
        // })
    })

    newEl.appendChild(document.createTextNode(altTitle.sortedCustomTitles[0]['lastVersion'].text + ' '));
    return newEl;
}


function acceptInputOnHeadline (headlineContainer) {
    headlineContainer.setAttribute('data-headline-id', Math.random().toString(36).substring(2, 15));
    headlineContainer.addEventListener('click', openCustomTitlesDialog )
    headlineContainer.classList.add('headline-clickable');
}

function findAndReplaceTitle(title, remove) {
    let results = getElementsContainingText(title.text);
    results = results.filter(el => !(['SCRIPT', 'TITLE'].includes(el.nodeName)));

    console.log('results of els', results)
    // if (!results.length) {
    //     let similarText = getFuzzyTextSimilarToHeading(title.text);
    //     if (similarText)
    //         results = getElementsContainingText(similarText);
    // }

    let nonScriptResultsCount = 0;

    // observer.disconnect();

    results.forEach(el => {
        if (el.nodeName != 'SCRIPT') {
            nonScriptResultsCount += 1;

            console.log('element found', el)

            //if headline has not been modified yet
            if (!el.classList.contains('headline-modified')) {

                const originalTitle = el.textContent;
                el.textContent = "";
                let newFirstChild = addAltTitleNodeToHeadline(title)

                const newSecondChild = document.createElement('del');
                newSecondChild.classList.add('headline-modified');
                newSecondChild.appendChild(document.createTextNode(originalTitle));


                el.appendChild(newFirstChild);
                el.appendChild(newSecondChild);
            }
            else {
                //if headline has already been modified, the displayed alt headline either needs to change to another (in case of headline editing or removing), or the alt headline should be removed altogether and the style of the original headline should be restored back to its original state (in case there is no alt headline left for the headline)
                let headlineContainer = el.parentNode;

                if (headlineContainer.children.length == 2) {
                    headlineContainer.removeChild(headlineContainer.children[0]);
                    if (remove == true) {
                        headlineContainer.appendChild(document.createTextNode(headlineContainer.children[0].textContent));
                        headlineContainer.removeChild(headlineContainer.children[0]);

                        acceptInputOnHeadline(headlineContainer)

                        /*
                        manually redirecting to the headline view with the correct params (the dialog that is open now corresponds to a view that has titleId as a param. And that titleId along with its corresponding standaloneTitle has been deleted from the store and no longer exists)
                        */
                        // browser.runtime.sendMessage({
                        //     type: 'direct_to_custom_titles',
                        //     data: {
                        //         titleText: headlineContainer.textContent,
                        //         titleElementId: headlineContainer.getAttribute('data-headline-id'),
                        //         titleId: null
                        //     }
                        // })

                    }
                    else {
                        let newFirstChild = addAltTitleNodeToHeadline(title)
                        headlineContainer.insertBefore(newFirstChild, headlineContainer.children[0])
                    }
                    
                }
            }

        }
    })
    // globalHelper.observer.observe(Helper.getObserverConfigs[0], Helper.getObserverConfigs[1]);
    return nonScriptResultsCount;
}


function htmlDecode(input) {
    let doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
}


function openCustomTitlesDialog(ev) {
    browser.runtime.sendMessage({
        type: 'direct_to_custom_titles',
        data: {
            titleText: ev.target.innerText,
            titleElementId: ev.target.getAttribute('data-headline-id')
        }
    })
}

function identifyPotentialTitles() {
    let elResults = [];
    try {
        let ogTitle = htmlDecode(document.querySelector('meta[property="og:title"]').getAttribute('content'));
        elResults = getElementsContainingText(ogTitle).filter(el => !(['SCRIPT', 'TITLE'].includes(el.nodeName)));
        console.log(elResults)
    }
    catch(err) {
        console.log('in og:title, error is', err)
    }

    try {
        if (!elResults.length) {
            let twitterTitle = htmlDecode(document.querySelector('meta[name="twitter:title"]').getAttribute('content'));
            elResults = getElementsContainingText(twitterTitle).filter(el => !(['SCRIPT', 'TITLE'].includes(el.nodeName)));
            console.log(elResults)
        }
    }
    catch(err) {
        console.log('in twitter:title, error is', err)
    }

    if (!elResults.length) {
        elResults = document.querySelectorAll('h1');
    }

    elResults.forEach(heading => {            
        acceptInputOnHeadline(heading)
    })

    // observer.observe(targetNode, config);
}

export default {
    findAndReplaceTitle,
    identifyPotentialTitles
}