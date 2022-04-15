let speed = 1;
const playerMap = new Map();
let whiteList;

chrome.storage.sync.get('speed').then(val => {
    if (val.speed === undefined) {
        chrome.storage.sync.set({ 'speed': 1 })
        speed = 1
    }
    else {
        speed = val.speed;
    }
    setIconText()
})
chrome.webNavigation.onCompleted.addListener(onSiteUpdated);
chrome.webNavigation.onHistoryStateUpdated.addListener(onSiteUpdated);
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    processMessageData(message, sender).then(response => sendResponse(response));
    return true;
})

async function processMessageData(message, sender) {
    switch (message) {
        case 'changedSpeed': {
            await loadSpeed();
            setIconText()
            for (const [key, value] of playerMap.entries()) {
                chrome.scripting.executeScript({
                    target: { tabId: key },
                    function: setVideoSpeed,
                    args: [speed]
                });
            }
            break;
        }
        case 'isThisIn': {
            let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            return { status: 'ok', in: (playerMap.get(tab.id) == null ? 'false' : 'true') }
        }
        case 'addOrRemoveThisWebsite': {
            let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (playerMap.get(tab.id) == null) {
                playerMap.set(tab.id, tab.id);
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: setVideoSpeed,
                    args: [speed]
                });
            } else {
                playerMap.delete(tab.id);
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: setVideoSpeed,
                    args: [1]
                });
            }
            break;
        }
        default: {
            break;
        }
    }
    return { status: 'ok' };
}



async function onSiteUpdated(tab) {
    if (playerMap.get(tab.tabId) == null) {
        return;
    }
    chrome.scripting.executeScript({
        target: { tabId: tab.tabId },
        function: setVideoSpeed,
        args: [speed]
    });
}
async function loadSpeed() {
    const val = await chrome.storage.sync.get('speed')
    if (val.speed === undefined) {
        await chrome.storage.sync.set({ 'speed': 1 })
        speed = 1
    }
    else {
        speed = val.speed;
    }
}
function setIconText() {
    chrome.action.setBadgeText({ 'text': `${speed}x` });
    chrome.action.setBadgeBackgroundColor({ 'color': '#006b02' })
}

function setVideoSpeed(speed) {
    let video = document.getElementsByTagName('video');
    for (let i = 0; i < video.length; i++) {
        video[i].playbackRate = speed;
        video[i].playbackRate = speed;
        video[i].addEventListener('loadeddata', () => {
            video[i].playbackRate = speed;
            video[i].playbackRate = speed;
        })
    }
}