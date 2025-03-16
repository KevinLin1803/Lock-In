// Replace with actual user email (should ideally be set dynamically)
const userEmail = "user@example.com";

// Track whether focus mode is active
let isFocusModeOn = false;
let currentTask = null; // Store the task associated with the focus session

// Listen for new tabs being created
chrome.tabs.onCreated.addListener((tab) => {
    if (isFocusModeOn) {
        console.log("Tab created:", tab);
        sendTabData(tab, "Tab Created");
    }
});

// Listen for URL changes (navigating to a new site or refreshing)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (isFocusModeOn && changeInfo.url) { // Ensures we're capturing only URL changes
        console.log("URL changed:", changeInfo.url);
        sendTabData(tab, "URL Changed");
    }
});

// Listen for tab switching (active tab changes)
chrome.tabs.onActivated.addListener((activeInfo) => {
    if (isFocusModeOn) {
        chrome.tabs.get(activeInfo.tabId, (tab) => {
            console.log("Tab switched:", tab);
            sendTabData(tab, "Tab Switched");
        });
    }
});

// Function to send data to the backend
function sendTabData(tab, eventType) {
    if (!tab || !tab.id || !tab.url) return;
     // Ignore invalid tabs

    const tabData = {
        url: tab.url,
        email: userEmail,
    };

    const url = new URL(tab.url);

    // Exclude Google searches and Google.com pages
    if (
        url.hostname.endsWith("google.com") &&
        (url.pathname === "/search" || url.hostname === "www.google.com") ||
        tab.url === "chrome://newtab/" || 
        tab.url === "about:newtab"
    ) {
        console.log("Ignoring Google search, Google homepage, or new tab:", url.href);
        return;
    }

    // console.log(eventType, tabData);
    fetch("https://jth0cy1p67.execute-api.ap-southeast-2.amazonaws.com/checkUrl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tabData)
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.isRelated == false) {
            self.registration.showNotification("Lock-In Check", {
                body: "Are you actually locked in bro?",
                icon: "experiment (1).jpeg"
            })
        }
        console.log("tab sent succesfully", data);
    })
    .catch((error) => console.error("Error sending tab data:", error));
}

// Get all open tabs at startup
chrome.tabs.query({}, (tabs) => {
    console.log("All open tabs at startup:", tabs);
});

// Listen for messages from the React app
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "START_FOCUS") {
        isFocusModeOn = true;
        currentTask = request.task; // Store the task
        getActiveTab((tab) => {
            sendFocusSessionData(currentTask);  // Assuming this is defined elsewhere
            sendTabData(tab, "Tab Created");
        });
        sendFocusSessionData(currentTask);
    } else if (request.type === "END_SESSION") {
        isFocusModeOn = false;
        currentTask = null; // Reset task
        sendEndSessionData();
    }
    sendResponse({ status: "Received" });
});

function getActiveTab(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];  // Assuming you're working with the active tab
        callback(tab);
    });
}

// Function to send focus session data
function sendFocusSessionData(task) {
    const focusData = {
        email: userEmail,
        prompt: task,
        // startTime: new Date().toISOString()
    };

    console.log("Focus session started:", focusData);    
    
    // Sending data to backend for session start
    fetch("https://jth0cy1p67.execute-api.ap-southeast-2.amazonaws.com/startSession", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(focusData)
    })
    .then((response) => response.json())
    .then((data) => console.log("Focus session sent successfully:", data))
    .catch((error) => console.error("Error sending focus session:", error));
}

// Function to send end session data
function sendEndSessionData() {
    const endSessionData = {
        email: userEmail,
        // endTime: new Date().toISOString()
    };

    console.log("Focus session ended:", endSessionData);

    // Sending data to backend for session end
    fetch("https://jth0cy1p67.execute-api.ap-southeast-2.amazonaws.com/endSession", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(endSessionData)
    })
    .then((response) => response.json())
    .then((data) => console.log("End session sent successfully:", data))
    .catch((error) => console.error("Error sending end session:", error));
}
