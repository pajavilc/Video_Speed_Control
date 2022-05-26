let speeds;
let speed;
let speedControls;
let listenerControl;
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
    visualizeActive();
    speedControlsSetup();
    navSetup();
    setupAddingListeners();
}


function setupAddingListeners() {
    listenerControl = document.getElementById('addThis');
    chrome.runtime.sendMessage('isThisIn', (response) => {
        if (!checkResponse(response)) {
            return;
        }

        let el;
        el = document.createElement('div');
        if (response.in === 'true') {
            el.className = 'isIn';
            el.innerText = 'Remove this site?';
        }
        else {
            el.className = 'isNotIn';
            el.innerText = 'Add this site?';
        }
        el.addEventListener('click', (_response) => {
            chrome.runtime.sendMessage('addOrRemoveThisWebsite', (_response) => {
                if (!checkResponse(_response)) return;
                changeListenerText();
            })
        })
        listenerControl.appendChild(el);
    })
}
function changeListenerText() {
    const el = document.querySelector('#addThis div');
    if (el.className === 'isIn') {
        el.className = 'isNotIn';
        el.innerText = 'Add this site?';
    }
    else {
        el.className = 'isIn';
        el.innerText = 'Remove this site?';
    }
}

function speedControlsSetup() {

    speedControls = document.getElementsByClassName('speedControl');
    for (let i = 0; i < speedControls.length; i++) {
        speedControls[i].addEventListener('click', () => {
            let nextSpeed = parseFloat((speedControls[i].innerText).split('x')[0]);
            chrome.storage.sync.set({ 'speed': nextSpeed }).then(() => {
                visualizeActive();
            });
            chrome.runtime.sendMessage('changedSpeed', (response) => {
                if (!checkResponse(response)) return

            })
        })
    }
}
function navSetup() {
    document.getElementById("change").addEventListener('click', () => {
        window.location.href = "popup.html";
    })
    document.getElementById("settings").addEventListener('click', () => {
        window.location.href = "settings.html";
    })
}

function visualizeActive() {
    chrome.storage.sync.get('speed').then(val => {
        if (val.speed === undefined) {
            chrome.storage.sync.set({ 'speed': 1 });
            const el = document.querySelector("#container > *:nth-child(1)");
            el.classList.add('active');
            speed = 1;
        }
        else {
            const x = document.querySelectorAll("#container > *");
            for (let i = 0; i < x.length; i++) {
                if (parseFloat((speedControls[i].innerText).split('x')[0]) === speed) {
                    x[i].classList.remove('active');
                }
                if (parseFloat((speedControls[i].innerText).split('x')[0]) === val.speed) {
                    x[i].classList.add('active')
                }
            }
            speed = val.speed;
        }
    })
}
function setSpeeds(speeds) {
    const container = document.getElementById('container');
    for (let i = 0; i < speeds.length; i++) {
        let el = document.createElement('button');
        el.className = 'speedControl';
        el.innerText = `${speeds[i]}x`;
        el.addEventListener('click', () => {
            let nextSpeed = speeds[i];
            chrome.storage.sync.set({ 'speed': nextSpeed }).then(() => {
                visualizeActive();
            });
            chrome.runtime.sendMessage('changedSpeed', (response) => {

            })
        })
        container.appendChild(el);
    }
}
function checkResponse(response) {
    if (response.status !== 'ok') {
        alert('Error getting response from extension. Please, restart the extension.');
        return false;
    }
    return true;
}

main()