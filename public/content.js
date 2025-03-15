console.log("Content script loaded and listening for messages.");

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'SHOW_NOTIFICATION') {
        console.log('CONTENT SCRIPT RECEIVED MESSAGE');
        alert('BRO IS NOT LOCKED IN');
    }
});
