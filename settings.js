
let speeds;

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

function setSpeeds(speeds) {
    const container = document.querySelector('#holder');
    container.innerHTML = '';
    for (let i = 0; i < speeds.length; i++) {
        let el = document.createElement('div');
        el.className = 'speedContainer';
        el.innerText += `${speeds[i]}px`;
        el.innerHTML += `<div class="cross"><div class="l"></div><div class="r"></div></div>`
        el.childNodes[1].addEventListener('click', () => {
            deleteSpeed(i);
        })
        container.appendChild(el);
    }
}

function deleteSpeed(id) {
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
    setSpeeds([2, 2.5, 3]);

}

function addSpeed(e) {
    e.preventDefault();


    const x = document.getElementById('addSpeed').value;
    if (isNaN(x) === true) {
        return false;
    }
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

document.getElementById('restart').addEventListener('click', resetAll)
document.getElementById('speedFormHolder').appendChild(returnSpeedForm());