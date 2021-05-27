import Vue from 'vue';
import store from '@/store';
import insertedApp from '@/App';
import router from '@/router';
import vuetify from '@/plugins/vuetify';

console.log('Hello from the content-script')

// let prevIframe = document.querySelector('iframe[data-sth="customPopupIframe"]');
// let iframe;
// // if (prevIframe === null) {
//     iframe = document.createElement('iframe');
//     iframe.classList.add('extension-side-bar');
//     iframe.setAttribute('src', chrome.extension.getURL("popup.html"));
//     iframe.setAttribute('data-sth', 'customPopupIframe')
//     document.body.appendChild(iframe);
// // }

browser.runtime.sendMessage({
    type: 'get_user'
})
.then(authUser => {

    console.log(authUser, 'here is authUser')
    if (authUser)
        localStorage.setItem('trustnetAuthToken', JSON.stringify(authUser));

    const container = document.createElement('div');
    container.setAttribute('data-vuetify', '')
    const app = document.createElement('div');
    app.setAttribute('id', 'vueApp');
    container.appendChild(app);
    document.body.prepend(container);

    /* eslint-disable no-new */
    new Vue({
        el: '#vueApp',
        store,
        router,
        vuetify,
        render: h => h(insertedApp),
    });
})




browser.runtime.onMessage.addListener( (msgObj, sender, sendResponse) => {
    // if (msgObj.type == 'close_sidebar') {
    //     iframe.classList.add('extension-hidden');
    // }
    // if (msgObj.type == 'inject_inpage_vue_app') {
        
    // }
})