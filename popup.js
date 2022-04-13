let speeds;
let speed;

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

let speedControls = document.getElementsByClassName('speedControl');
for (let i = 0; i < speedControls.length; i++) {
    speedControls[i].addEventListener('click', () => {
        let nextSpeed = parseFloat((speedControls[i].innerText).split('x')[0]);
        chrome.storage.sync.set({ 'speed': nextSpeed }).then(() => {
            visualizeActive();
        });
        chrome.runtime.sendMessage('changedSpeed')
    })
}
function setSpeeds(speeds) {
    const container = document.getElementById('container');
    for (let i = 0; i < speeds.length; i++) {
        let el = document.createElement('button');
        el.className = 'speedControl';
        el.innerText = `${speeds[i]}X`;
        el.addEventListener('click', () => {
            let nextSpeed = speeds[i];
            chrome.storage.sync.set({ 'speed': nextSpeed }).then(() => {
                visualizeActive();
            });
            chrome.runtime.sendMessage('changedSpeed')
        })
        container.appendChild(el);
    }
}
document.getElementById("change").addEventListener('click', () => {
    window.location.href = "popup.html";
})
document.getElementById("settings").addEventListener('click', () => {
    window.location.href = "settings.html";
})