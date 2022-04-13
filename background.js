let speed;
const playerMap = new Map();

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


let whiteList;
const filter = {
    url: [{
        hostSuffix: ".youtube.com"
    }]
}

chrome.webNavigation.onCompleted.addListener(async (tab) => {
    if (playerMap.get(tab.tabId) == null) {
        playerMap.set(tab.tabId, tab.tabId)
    }
    chrome.scripting.executeScript({
        target: { tabId: tab.tabId },
        function: setVideoSpeed,
        args: [speed]
    });
}, filter);


chrome.webNavigation.onHistoryStateUpdated.addListener(async (tab) => {
    if (playerMap.get(tab.tabId) == null) {
        playerMap.set(tab.tabId, tab.tabId)
    }
    chrome.scripting.executeScript({
        target: { tabId: tab.tabId },
        function: setVideoSpeed,
        args: [speed]
    });
}, filter);


chrome.runtime.onMessage.addListener(async (message) => {
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
        default: {
            break;
        }
    }
})




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
    chrome.action.setBadgeText({ 'text': `${speed}X` });
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