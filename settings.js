let speeds;
let shortcutSpeeds;

function main() {
    chrome.storage.sync.get('speeds').then(val => {
        if (val.speeds === undefined) {
            chrome.storage.sync.set({ 'speeds': [2, 2.5, 3] })
            speeds = [2, 2.5, 3];
            setSpeeds(speeds);
        }
        else {
            speeds = val.speeds;
            setSpeeds(speeds);
        }
    })
    chrome.storage.sync.get('shortcuts').then(val => {
        chrome.storage.sync.get('shortcuts').then(val => {
            if (val.shortcuts === undefined) {
                chrome.storage.sync.set({
                    'shortcuts': {
                        'first': 1,
                        'second': 1
                    }
                })
                sendShortcutSpeedsModified();
                shortcutSpeeds = {
                    'first': 1,
                    'second': 1
                }
            }
            else {
                shortcutSpeeds = val.shortcuts
            }
            setShortcutSpeeds();
        })
    })
    document.getElementById('restart').addEventListener('click', resetAll)
    document.getElementById('speedFormHolder').appendChild(returnSpeedForm());
}

function setShortcutSpeeds() {
    const container1 = document.getElementById('firstShort');
    const container2 = document.getElementById('secondShort');
    let el = document.createElement('option');
    el.innerText = `1x`;
    el.setAttribute('value', `1x`)
    let el2 = el.cloneNode(true);
    container1.appendChild(el);
    container2.appendChild(el2);
    for (let i = 0; i < speeds.length; i++) {
        let el = document.createElement('option');
        el.innerText = `${speeds[i]}x`;
        el.setAttribute('value', `${speeds[i]}x`)
        let el2 = el.cloneNode(true);
        container1.appendChild(el);
        container2.appendChild(el2);
    }
    container1.value = `${shortcutSpeeds.first}x`;
    container1.addEventListener('change', () => { readSpeed(true) })
    container2.value = `${shortcutSpeeds.second}x`;
    container2.addEventListener('change', () => { readSpeed(false) })
}
function readSpeed(isFirst) {
    if (isFirst === true) {
        let value = document.getElementById('firstShort').value;
        value = parseFloat(value.split('x')[0]);
        shortcutSpeeds.first = value;
    }
    else {
        let value = document.getElementById('secondShort').value;
        value = parseFloat(value.split('x')[0]);
        shortcutSpeeds.second = value;
    }
    chrome.storage.sync.set({
        'shortcuts': shortcutSpeeds
    }).then(sendShortcutSpeedsModified);
}
function sendShortcutSpeedsModified() {
    chrome.runtime.sendMessage('shortcutSpeedschanged', (response) => {
        !checkResponse(response)
    })
}

function setSpeeds(speeds) {
    const container = document.querySelector('#holder');
    container.innerHTML = '';
    for (let i = 0; i < speeds.length; i++) {
        let el = document.createElement('div');
        el.className = 'speedContainer';
        el.innerText += `${speeds[i]}x`;
        el.innerHTML += `<div class="cross"><div class="l"></div><div class="r"></div></div>`
        el.childNodes[1].addEventListener('click', () => {
            deleteSpeedFromStorage(i);
        })
        container.appendChild(el);
    }
}

function deleteSpeedFromStorage(id) {
    speeds = speeds.slice(0, id).concat(speeds.slice(id + 1));
    chrome.storage.sync.set({ 'speeds': speeds }).then(() => {
        const el = document.querySelectorAll(`#holder >*`)[id];
        el.remove();
        setSpeeds(speeds)
    })
}

function resetAll() {
    chrome.storage.sync.set({ 'speeds': [2, 2.5, 3] }).then(() => {
        speeds = [2, 2.5, 3]
    });
    chrome.storage.sync.set({
        'shortcuts': {
            'first': 1,
            'second': 1
        }
    }).then(setShortcutSpeeds);
    setSpeeds([2, 2.5, 3]);
    location.reload();
}

function addSpeed(e) {
    e.preventDefault();
    const inputFieldElement = document.getElementById('addSpeed');
    const x = inputFieldElement.value;
    if (isNaN(x) === true) {
        return false;
    }
    inputFieldElement.value = '';

    const speed = parseFloat(x);
    speeds[speeds.length] = speed;
    chrome.storage.sync.set({ 'speeds': speeds });
    setSpeeds(speeds);
    e.preventDefault()
    return false
}

function returnSpeedForm() {
    const el = document.createElement('form');

    el.setAttribute("id", "speedForm")
    el.setAttribute('noValidate', true);
    el.innerHTML = '<input type="text" placeholder="Add new speed" name="add" id="addSpeed"></form>';
    el.addEventListener('submit', addSpeed);
    return el;
}
document.getElementById("change").addEventListener('click', () => {
    window.location.href = "popup.html";
})
document.getElementById("settings").addEventListener('click', () => {
    window.location.href = "settings.html";
})
function checkResponse(response) {
    if (response.status !== 'ok') {
        alert('Error getting response from extension. Please, restart the extension.');
        return false;
    }
    return true;
}


main();