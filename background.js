let speed = 1;
const playerMap = new Map();
let whiteList;
let shortcutSpeeds = {};

loadSpeeds();
loadShortcutSpeeds()
chrome.webNavigation.onCompleted.addListener(onSiteUpdated);
chrome.webNavigation.onHistoryStateUpdated.addListener(onSiteUpdated);
chrome.tabs.onRemoved.addListener(onTabClosed);
chrome.commands.onCommand.addListener(processCommand);
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    processMessageData(message, sender).then(response => sendResponse(response));
    return true;
})

async function processMessageData(message, sender) {
    switch (message) {
        case 'changedSpeed': {
            await loadSpeed();
            setIconText();
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
            const tabId = tab.id;
            const mappedSite = playerMap.get(tabId);
            return { status: 'ok', in: (mappedSite == null ? 'false' : 'true') }
        }
        case 'addOrRemoveThisWebsite': {
            let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const tabId = tab.id;
            if (playerMap.get(tabId) == null) {
                updateSpeedOnListedSites(speed)
            } else {
                updateSpeedOnListedSites(1);
            }
            break;
        }
        case 'shortcutSpeedschanged': {
            loadShortcutSpeeds();
        }
        default: {
            break;
        }
    }
    return { status: 'ok' };
}

async function processCommand(command) {
    switch (command) {
        case "AddToListOrRemoveFromList": {
            let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const tabId = tab.id;
            if (playerMap.get(tabId) == null) {
                playerMap.set(tabId, tabId);
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    function: setVideoSpeed,
                    args: [speed]
                });
            } else {
                playerMap.delete(tabId);
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    function: setVideoSpeed,
                    args: [1]
                });
            }
            return;
        }
        case "SetSpeedDefault": {
            speed = 1;
            chrome.storage.sync.set({ 'speed': speed });
            updateSpeedOnListedSites(speed);
            setIconText()
            return;
        }
        case "SetSpeed1": {
            speed = shortcutSpeeds.first;
            chrome.storage.sync.set({ 'speed': speed });
            updateSpeedOnListedSites(speed);
            setIconText()
            return;
        }
        case "SetSpeed2": {
            speed = shortcutSpeeds.second;
            chrome.storage.sync.set({ 'speed': speed });
            updateSpeedOnListedSites(speed)
            setIconText()
            return;
        }
        default: {
            return;
        }
    }
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
function loadShortcutSpeeds() {
    chrome.storage.sync.get('shortcuts').then(val => {
        if (val.shortcuts === undefined) {
            chrome.storage.sync.set({
                'shortcuts': {
                    'first': 1,
                    'second': 1
                }
            })
            shortcutSpeeds = {
                'first': 1,
                'second': 1
            }
        }
        else {
            shortcutSpeeds = val.shortcuts
        }
    })
}

function loadSpeeds() {
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
}
function updateSpeedOnListedSites(speed) {
    for (const [key, value] of playerMap.entries()) {
        chrome.scripting.executeScript({
            target: { tabId: key },
            function: setVideoSpeed,
            args: [speed]
        });
    }
}
function onTabClosed(tabId) {
    playerMap.delete(tabId);
}