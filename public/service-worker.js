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
    if (!tab || !tab.id || !tab.url) return; // Ignore invalid tabs

    const tabData = {
        id: tab.id,
        url: tab.url,
        title: tab.title || "Unknown",
        timeStamp: new Date().toISOString(),
        eventType: eventType,
        email: userEmail,
        focusTask: currentTask, // Attach current focus task
    };

    console.log(eventType, tabData);

    // Uncomment to send data to backend
    // fetch("https://your-backend.com/api/tabs", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(tabData)
    // })
    // .then((response) => response.json())
    // .then((data) => console.log("Tab event sent successfully:", data))
    // .catch((error) => console.error("Error sending tab data:", error));
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
        sendFocusSessionData(currentTask);
    } else if (request.type === "END_SESSION") {
        isFocusModeOn = false;
        currentTask = null; // Reset task
        sendEndSessionData();
    }
    sendResponse({ status: "Received" });
});

// Function to send focus session data
function sendFocusSessionData(task) {
    const focusData = {
        email: userEmail,
        task: task,
        startTime: new Date().toISOString()
    };

    console.log("Focus session started:", focusData);

    // Uncomment to send data to backend
    // fetch("https://your-backend.com/api/session/start", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(focusData)
    // })
    // .then((response) => response.json())
    // .then((data) => console.log("Focus session sent successfully:", data))
    // .catch((error) => console.error("Error sending focus session:", error));
}

// Function to send end session data
function sendEndSessionData() {
    const endSessionData = {
        email: userEmail,
        endTime: new Date().toISOString()
    };

    console.log("Focus session ended:", endSessionData);

    // Uncomment to send data to backend
    // fetch("https://your-backend.com/api/session/end", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(endSessionData)
    // })
    // .then((response) => response.json())
    // .then((data) => console.log("End session sent successfully:", data))
    // .catch((error) => console.error("Error sending end session:", error));
}
