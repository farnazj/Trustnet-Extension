console.log('Hello from the content-script')

let iframe = document.createElement('iframe');
iframe.classList.add('extension-side-bar');
iframe.src = chrome.extension.getURL("popup.html")
document.body.appendChild(iframe);