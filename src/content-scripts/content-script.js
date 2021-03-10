import Vue from 'vue';
import store from '@/store';
import insertedApp from '@/App';
import router from '@/router';
import vuetify from '@/plugins/vuetify';

console.log('Hello from the content-script')

let prevIframe = document.querySelector('iframe[data-sth="customPopupIframe"]');
let iframe;
// if (prevIframe === null) {
    iframe = document.createElement('iframe');
    iframe.classList.add('extension-side-bar');
    iframe.setAttribute('src', chrome.extension.getURL("popup.html"));
    iframe.setAttribute('data-sth', 'customPopupIframe')
    document.body.appendChild(iframe);
// }




browser.runtime.onMessage.addListener( (msgObj, sender, sendResponse) => {
    if (msgObj.type == 'close_sidebar') {
        iframe.classList.add('extension-hidden');
    }
    if (msgObj.type == 'inject_inpage_vue_app') {
        const app = document.createElement('div');
        app.setAttribute('id', 'vueApp');
        document.body.prepend(app);

        /* eslint-disable no-new */
        new Vue({
            el: '#vueApp',
            store,
            router,
            vuetify,
            render: h => h(insertedApp),
        });
    }
})