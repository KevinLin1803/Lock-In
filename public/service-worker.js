// Replace with actual user email (should ideally be set dynamically)
let userEmail = "example@gmail.com";

// Track whether focus mode is active
let isFocusModeOn = false;
let currentTask = null; // Store the task associated with the focus session

// Website identification and scraping

function checkAndScrapeYouTube(tabId, url) {
    console.log("checkAndScrapeYouTube is being called with URL:", url);
    
    if (url && url.includes("youtube.com/watch")) {
        console.log("User is watching a video.");

        chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: scrapeYoutubeWatch
        }).then(() => console.log("executeScript was successfully triggered"))
          .catch(error => console.error("Error executing script:", error));

    } else if (url && url.includes("youtube.com/results")) {
        console.log("User is on YouTube search results.");

        chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: scrapeYouTubeResults
        }).then(() => console.log("executeScript was successfully triggered"))
          .catch(error => console.error("Error executing script:", error));

    } else if (url && url.includes("youtube.com")) {
        console.log("User is on YouTube home, attempting to scrape recommendations...");
        
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: scrapeYouTubeHome
        }).then(() => console.log("executeScript was successfully triggered"))
          .catch(error => console.error("Error executing script:", error));
    }
}

let uniqueElements = {}; // Global dictionary to store video elements
let contentSimilarityScore = []
let content = []

function scrapeYouTubeHome() {
    console.log("scrapeYoutubeHome is being called");
    try {
        uniqueElements = {}; // Reset dictionary before scraping

        const elements = document.querySelectorAll(`ytd-rich-grid-media ytd-thumbnail a#thumbnail, ytd-rich-grid-media ytd-thumbnail, ytd-rich-grid-media ytd-thumbnail a#thumbnail > *`);

        elements.forEach((video) => {
            const videoTile = video.closest("ytd-rich-grid-media");
            const title = videoTile?.querySelector("#video-title")?.innerText.trim();
            const url = video.href;

            if (title && url) {
                uniqueElements[title] = { url, video: video }; // Store the video tile element
            }

            video.style.opacity = 0
            
            console.log(title)

        });

        chrome.runtime.sendMessage({ type: "YOUTUBE_RECOMMENDATIONS", recommendations: Object.keys(uniqueElements), uniqueElements: uniqueElements });
        console.log("YouTube Recommendations:", uniqueElements);



        // Call function to hide elements
        // hideYouTubeRecommendations();

    } catch (error) {
        console.error("Error scraping YouTube recommendations:", error);
    }
}

function hideYouTubeRecommendations() {
    console.log("HEREHERE");
    console.log("Content Similarity Scores:", contentSimilarityScore);
    console.log("Content:", content);
    console.log("uniqueElements", uniqueElements)

    if (!Array.isArray(contentSimilarityScore) || !Array.isArray(content)) {
        console.error("Error: contentSimilarityScore or content is not an array.");
        return;
    }

    for (let i = 0; i < content.length; i++) {
        console.log(`Score for index ${i}: ${contentSimilarityScore[i]}`);

        if (contentSimilarityScore[i] < 0.1) {
            console.log(`Hiding recommendation: ${content[i]}`);
            // You need to target the actual DOM element and hide it
            console.log(uniqueElements[content[i]])
            console.log(typeof(uniqueElements[content[i]]))
            if (uniqueElements[content[i]].video) {
                uniqueElements[content[i]].video.style.opacity = 0; // Hide video
            }
        }
    }
}



function scrapeYoutubeWatch() {
    console.log("scrapeYoutubeWatch is being called");
    try {
        const elements = document.querySelectorAll("a#thumbnail.yt-simple-endpoint.inline-block.style-scope.ytd-thumbnail");

        let recommendations = [];
        elements.forEach((video) => {
            const titleElement = video.closest("ytd-compact-video-renderer, ytd-video-renderer")?.querySelector("#video-title");
            const title = titleElement?.innerText.trim();
            const url = video.href.startsWith("/") ? `https://www.youtube.com${video.href}` : video.href;
            if (title && url) {
                recommendations.push({ title, url });
            }
        });

        chrome.runtime.sendMessage({ type: "YOUTUBE_WATCH_RECOMMENDATIONS", recommendations });
        console.log("YouTube Watch Recommendations:", recommendations);
    } catch (error) {
        console.error("Error scraping YouTube watch recommendations:", error);
    }
}

function scrapeYouTubeResults() {
    console.log("scrapeYouTubeResults is being called");
    try {
        const elements = document.querySelectorAll('a#thumbnail.yt-simple-endpoint.inline-block.style-scope.ytd-thumbnail');
        let recommendations = [];

        elements.forEach((video) => {
            const videoContainer = video.closest("ytd-video-renderer");
            const title = videoContainer?.querySelector("#video-title")?.innerText.trim();
            const url = video.href.startsWith("/") ? "https://www.youtube.com" + video.href : video.href;

            if (title && url) {
                recommendations.push({ title, url });
            }
        });

        chrome.runtime.sendMessage({ type: "YOUTUBE_SEARCH_RESULTS", recommendations });
        console.log("YouTube Search Results:", recommendations);
    } catch (error) {
        console.error("Error scraping YouTube search results:", error);
    }
}



chrome.identity.getProfileUserInfo({ accountStatus: 'ANY' }, (userInfo) => {
    if (chrome.runtime.lastError) {
        console.error("Error:", chrome.runtime.lastError);
    } else {
        console.log("User email:", userInfo.email);
        userEmail = userInfo.email
    }
});
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
        
        checkAndScrapeYouTube(tabId, changeInfo.url);
    }
});

// Listen for tab switching (active tab changes)
chrome.tabs.onActivated.addListener((activeInfo) => {
    if (isFocusModeOn) {
        chrome.tabs.get(activeInfo.tabId, (tab) => {
            console.log("Tab switched:", tab);
            sendTabData(tab, "Tab Switched");
            
            checkAndScrapeYouTube(tab.id, tab.url);
        });
    }
});

// Function to send data to the backend
function sendTabData(tab, eventType) {
    // if (!tab || !tab.id || !tab.url) 
    //     return;
     // Ignore invalid tabs

    const tabData = {
        // id: tab.id,
        url: tab.url,
        // title: tab.title || "Unknown",
        // timeStamp: new Date().toISOString(),
        // eventType: eventType,
        email: userEmail,
        // focusTask: currentTask, // Attach current focus task
    };

    console.log(eventType, tabData);

    // Gets the data from here and if it works we happy
    fetch("https://jth0cy1p67.execute-api.ap-southeast-2.amazonaws.com/checkUrl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tabData)
    })
    .then((response) => response.json())
    .then((data) => console.log("Tab event sent successfully:", data))
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
        sendFocusSessionData(currentTask);
        sendTabData(tab, "Tab Created")
    } else if (request.type === "END_SESSION") {
        isFocusModeOn = false;
        currentTask = null; // Reset task
        sendEndSessionData();
    } else if (request.type === "YOUTUBE_RECOMMENDATIONS") {
        console.log("Received YouTube recommendations:", request.recommendations);
        console.log(typeof request.recommendations);
        content = request.recommendations
        uniqueElements = request.uniqueElements
        query({"inputs": {
            "source_sentence": currentTask,
            "sentences": request.recommendations
        }}).then((response) => {
            console.log(JSON.stringify(response));
            contentSimilarityScore = JSON.parse(JSON.stringify(response));
            hideYouTubeRecommendations();
        });
    } else if (request.type === "YOUTUBE_WATCH_RECOMMENDATIONS") {
        console.log("Received YouTube recommendations:", request.recommendations);
    } else if (request.type === "YOUTUBE_SEARCH_RESULTS") {
        console.log("Received YouTube recommendations:", request.recommendations);
    }
    sendResponse({ status: "Received" });
});

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
        endTime: new Date().toISOString()
    };

    console.log("Focus session ended:", endSessionData);

    fetch("https://jth0cy1p67.execute-api.ap-southeast-2.amazonaws.com/endSession", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(endSessionData)
    })
    .then((response) => response.json())
    .then((data) => {
        console.log("End session sent successfully:", data);
        
        // Store the response in a JSON file
        fs.writeFileSync("analytics.json", JSON.stringify(data, null, 2), "utf8");

        console.log("Response saved to endSessionResponse.json");
    })
    .catch((error) => console.error("Error sending end session:", error));
}

// async function sendCategorisationData(recommendations) {
//     for (const recommendation of recommendations) {
//         const categorisationData = {
//             category: currentTask,
//             sentence: recommendation // Ensure this field exists
//         };

//         console.log("Sending categorisation data:", categorisationData);

//         try {
//             // Delay before sending the request
//             await new Promise(resolve => setTimeout(resolve, 2000));

//             const response = await fetch("http://localhost:3000/api/categorise", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(categorisationData)
//             });

//             if (!response.ok) {
//                 throw new Error(`HTTP error! Status: ${response.status}`);
//             }

//             const data = await response.json();
//             console.log("Categorisation response:", data);
//         } catch (error) {
//             console.error("Error sending categorisation data:", error.message);
//         }
//     }
// }

async function query(data) {
	const response = await fetch(
		"https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2",
		{
			headers: {
				Authorization: "Bearer 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",
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.json();
	return result;
}

