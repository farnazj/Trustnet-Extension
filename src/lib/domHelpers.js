
import store from '@/store'

function getSiblings(e) {
    // for collecting siblings
    let siblings = []; 
    // if no parent, return no sibling
    if (!e.parentNode) {
        return siblings;
    }
    // first child of the parent node
    let sibling  = e.parentNode.firstChild;
    
    // collecting siblings
    while (sibling) {
        if (sibling.nodeType === 1 && sibling !== e) {
            siblings.push(sibling);
        }
        sibling = sibling.nextSibling;
    }
    return siblings;
}

function isEmbedded(link) {
    // let siblings = getSiblings(link);
    // let linkIsEmbedded = false;

    // for (const sibling of siblings) {
    //     if (sibling.innerText.trim().length) {
    //         linkIsEmbedded = true;
    //         break;
    //     }
    // }
    //return linkIsEmbedded;
    return link.parentElement.innerText.trim().length > link.innerText.trim().length;
    
}

/*
This function changes the UI to signify assessed or questioned links
*/
function populateLinkAssessments (allLinksAssessments) {

    for (const link of Object.keys(allLinksAssessments)) {
        console.log('inja', link, allLinksAssessments[link])

        if (allLinksAssessments[link].confirmed.length ||
            allLinksAssessments[link].refuted.length ||
            allLinksAssessments[link].questioned.length) {

                let linkEls = document.querySelectorAll(`a[href='${link}']`);
                console.log('did it find elements', linkEls, 'for link', link)

                if (linkEls.length) {
        
                    let linkIsQuestioned = store.getters['linkAssessments/isQuestioned'](allLinksAssessments[link]);
                    if (linkIsQuestioned) {
                        let questionIcon = document.createElement('span');
                        questionIcon.innerHTML = `
                        <svg style="width:24px;height:24px" viewBox="0 0 24 24" class="link-accuracy-icon link-accuracy-icon-questioned">
                            <path fill="currentColor" d="M15.07,11.25L14.17,12.17C13.45,12.89 13,13.5 13,15H11V14.5C11,13.39 11.45,12.39 12.17,11.67L13.41,10.41C13.78,10.05 14,9.55 14,9C14,7.89 13.1,7 12,7A2,2 0 0,0 10,9H8A4,4 0 0,1 12,5A4,4 0 0,1 16,9C16,9.88 15.64,10.67 15.07,11.25M13,19H11V17H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z" />
                        </svg>
                        `;
        
                        //add question icon
                        linkEls.forEach(linkEl => {
                            if (!linkEl.getAttribute('trustnet-modified-question-link')) {
            
                                let iconToAddClone = questionIcon.cloneNode(true);
                                let accuracyClass;
                                if (isEmbedded(linkEl)) {
                                    accuracyClass = 'inline-accuracy-icon';
                                    [...linkEl.children].forEach(child => {
                                        child.style.display = "inline";
                                    });
                                }
                                else {
                                    accuracyClass = 'overlay-accuracy-icon';
                                    if (['inline', ''].includes(linkEl.style.display))
                                        linkEl.style.display = 'inline-block';
                                }
                                    
                                iconToAddClone.classList.add(accuracyClass);
                                linkEl.prepend(iconToAddClone);

                                linkEl.setAttribute('trustnet-modified-question-link', true);
                            }
                            
                        });
                    }
            
                    let specialStatus = false;
                    const iconToAdd = document.createElement('span');
            
                    let linkIsRefuted = store.getters['linkAssessments/isRefuted'](allLinksAssessments[link]);
                    console.log('isRefuted', linkIsRefuted)
                    if (linkIsRefuted) {
                        iconToAdd.innerHTML = `
                        <svg style="width:24px;height:24px" viewBox="0 0 24 24" class="link-accuracy-icon link-accuracy-icon-inaccurate">
                            <path fill="currentColor" d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z" />
                        </svg>
                        `;
                        specialStatus = 'inaccurate';
                    }
                    else {
                        let linkIsConfirmed = store.getters['linkAssessments/isConfirmed'](allLinksAssessments[link]);
                        console.log('isConfirmed', linkIsConfirmed)
                        if (linkIsConfirmed) {
                            iconToAdd.innerHTML = `
                            <svg style="width:24px;height:24px" viewBox="0 0 24 24" class="link-accuracy-icon link-accuracy-icon-accurate">
                                <path fill="currentColor" d="M10,17L5,12L6.41,10.58L10,14.17L17.59,6.58L19,8M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                            </svg>
                            `;
                            specialStatus = 'accurate';
                        }
                        else {
                            let linkIsDebated = store.getters['linkAssessments/isDebated'](allLinksAssessments[link]);
                            console.log('isDebated', linkIsDebated)
                            if (linkIsDebated) {
                                iconToAdd.innerHTML = `
                                <svg style="width:24px;height:24px" viewBox="0 0 24 24" class="link-accuracy-icon link-accuracy-icon-inaccurate">
                                    <path fill="currentColor" d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z" />
                                </svg>
                                <svg style="width:24px;height:24px" viewBox="0 0 24 24" class="link-accuracy-icon link-accuracy-icon-accurate">
                                    <path fill="currentColor" d="M10,17L5,12L6.41,10.58L10,14.17L17.59,6.58L19,8M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                                </svg>
                                `;
                                specialStatus = 'debated';
                            }
                        }
                    }
            
                    // add assessment icon
                    if (specialStatus) {
                        linkEls.forEach(linkEl => {
                            if (!linkEl.getAttribute('trustnet-modified-link')) {
                                
                                // if (!linkEl.getAttribute('trustnet-modified-question-link')) {
                                        
                                    // [...linkEl.children].forEach(child => {
                                    //     child.style.display = "inline";
                                    // });
                                // }

                                if (specialStatus == 'inaccurate') {
                                    linkEl.setAttribute('inaccurate-link', true);
                                    [...linkEl.children].forEach(child => {
                                        child.setAttribute('inaccurate-link', true);
                                    });
                                }
            
                                let iconToAddClone = iconToAdd.cloneNode(true);
                                let accuracyClass;

                                if (isEmbedded(linkEl)) {
                                    accuracyClass = 'inline-accuracy-icon';
                                    [...linkEl.children].forEach(child => {
                                        child.style.display = "inline";
                                    });
                                }
                                else {
                                    accuracyClass = 'overlay-accuracy-icon';
                                    if (['inline', ''].includes(linkEl.style.display))
                                        linkEl.style.display = 'inline-block';
                                }
                                    
                                iconToAddClone.classList.add(accuracyClass);

                                linkEl.prepend(iconToAddClone);
                                linkEl.setAttribute('trustnet-modified-link', true);
               
                            }
                             
                        });
                    }

                    if (linkIsQuestioned || specialStatus) {

                        linkEls.forEach(linkEl => {

                            if (!linkEl.getAttribute('trustnet-listener')) {

                                linkEl.setAttribute('trustnet-listener', true);

                                browser.runtime.sendMessage({
                                    type: 'log_interaction',
                                    interaction: {
                                        type: 'link_encounter', 
                                        data: { 
                                            link: link,
                                            pageURL: window.location.href,
                                            accuracyStatus: specialStatus ? specialStatus : null,
                                            isQuestioned: linkIsQuestioned
                                        }
                                    }
                                });

                                linkEl.addEventListener('click', function(ev) {
                                    browser.runtime.sendMessage({
                                        type: 'log_interaction',
                                        interaction: {
                                            type: 'link_click', 
                                            data: { 
                                                link: link,
                                                pageURL: window.location.href,
                                                accuracyStatus: specialStatus ? specialStatus : null,
                                                isQuestioned: linkIsQuestioned
                                            }
                                        }
                                    })
                                }, true) //the event should run on the capture phase to make sure this is executed before the click handler on the element itself which redirects to another page
                            }
                        })
                        
                    }
                }
            }
        
    }
}

export default {
    populateLinkAssessments
}