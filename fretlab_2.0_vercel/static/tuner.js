
const landingScreen = document.getElementById('landing-screen');
const tunerScreen = document.getElementById('tuner-screen');
const modeSwitch = document.getElementById('mode-switch');
const modeToggleContainer = document.querySelector('.mode-toggle');
const labelAuto = document.getElementById('label-auto');
const labelManual = document.getElementById('label-manual');
const pageTitle = document.getElementById('page-title');
const brandLink = document.getElementById('brand-link');

const btnEar = document.getElementById('btn-ear');
const btnMic = document.getElementById('btn-mic');


const tuningRadios = document.querySelectorAll('input[name="tuning-mode"]');

const stringBtns = document.querySelectorAll('.string-btn');
const currentNoteDisplay = document.getElementById('current-note');
const currentCentsDisplay = document.getElementById('current-cents');
const exactFrequencyDisplay = document.getElementById('exact-frequency');
const tunerBall = document.getElementById('tuner-ball');
const targetCircle = document.getElementById('target-circle');


let audioContext;
let analyser;
let microphone;
let isTuning = false;
let appMode = 'mic';


const standardStringsBase = [
    { name: 'E', frequency: 82.41, id: 'E2', order: 0 },
    { name: 'A', frequency: 110.00, id: 'A', order: 1 },
    { name: 'D', frequency: 146.83, id: 'D', order: 2 },
    { name: 'G', frequency: 196.00, id: 'G', order: 3 },
    { name: 'B', frequency: 246.94, id: 'B', order: 4 },
    { name: 'e', frequency: 329.63, id: 'E4', order: 5 }
];

let currentStrings = [...standardStringsBase];

let isAutoMode = true;
let manualTargetString = currentStrings[5];
let currentOffset = 0;

const noteNames = ["E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#"];

btnEar.addEventListener('click', () => {
    appMode = 'ear';
    openTuner();
});

btnMic.addEventListener('click', () => {
    appMode = 'mic';
    openTuner();
});

brandLink.addEventListener('click', (e) => {
    isTuning = false;
    if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
        audioContext = null;
    }
});

function openTuner() {
    landingScreen.classList.remove('active');
    tunerScreen.classList.add('active');

    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    if (appMode === 'ear') {
        pageTitle.innerText = "By Ear Tuner";
        modeToggleContainer.style.display = 'none';


        isAutoMode = false;
        isTuning = false;


        currentCentsDisplay.style.display = 'none';
        exactFrequencyDisplay.style.display = 'none';
        currentNoteDisplay.innerText = "-";
        targetCircle.classList.remove('perfect');
    } else {
        pageTitle.innerText = "Microphone Tuner";
        modeToggleContainer.style.display = 'flex';
        currentCentsDisplay.style.display = 'block';
        exactFrequencyDisplay.style.display = 'inline';
        targetCircle.classList.remove('perfect');


        isAutoMode = true;
        modeSwitch.checked = false;
        labelAuto.classList.add('active');
        labelManual.classList.remove('active');
        clearStringSelection();


        initAudio();
    }
}


document.body.addEventListener('click', () => {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
});


tuningRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if(e.target.checked) {
            currentOffset = parseInt(e.target.value);
            recalculateTuning();
        }
    });
});

function getNoteNameWithOffset(baseNoteName, offset) {
    let nameToFind = baseNoteName === 'e' ? 'E' : baseNoteName;
    let idx = noteNames.indexOf(nameToFind);

    let newIdx = (idx + offset) % 12;
    if (newIdx < 0) newIdx += 12;

    let newName = noteNames[newIdx];
    if (baseNoteName === 'e') newName = newName.toLowerCase();

    return newName;
}

function recalculateTuning() {
    currentStrings = standardStringsBase.map(s => {
        let newFreq = s.frequency * Math.pow(2, currentOffset / 12);
        let newName = getNoteNameWithOffset(s.name, currentOffset);

        return {
            ...s,
            frequency: newFreq,
            name: newName
        };
    });

    manualTargetString = currentStrings.find(s => s.id === manualTargetString.id);

    stringBtns.forEach(btn => {
        const stringId = btn.getAttribute('data-string');
        const strData = currentStrings.find(s => s.id === stringId);

        btn.querySelector('.string-name').innerText = strData.name;
        btn.querySelector('.string-freq').innerText = strData.frequency.toFixed(1) + " Hz";
    });
}


modeSwitch.addEventListener('change', (e) => {
    isAutoMode = !e.target.checked;

    if (isAutoMode) {
        labelAuto.classList.add('active');
        labelManual.classList.remove('active');
        clearStringSelection();
    } else {
        labelManual.classList.add('active');
        labelAuto.classList.remove('active');
        highlightStringBtn(manualTargetString.id);
    }
});


function playTone(frequency) {
    if (!audioContext) return;

    const osc = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, audioContext.currentTime);

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.5);

    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);

    osc.start();
    osc.stop(audioContext.currentTime + 1.6);
}

stringBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const stringId = btn.getAttribute('data-string');
        manualTargetString = currentStrings.find(s => s.id === stringId);

        if (appMode === 'mic') {
            modeSwitch.checked = true;
            isAutoMode = false;
            labelManual.classList.add('active');
            labelAuto.classList.remove('active');
            highlightStringBtn(stringId);
        } else {

            highlightStringBtn(stringId);
            setTimeout(() => clearStringSelection(), 1500);
            currentNoteDisplay.innerText = manualTargetString.name;
        }

        playTone(manualTargetString.frequency);
    });
});

function highlightStringBtn(id) {
    stringBtns.forEach(b => b.classList.remove('active'));
    document.querySelector(`.string-btn[data-string="${id}"]`).classList.add('active');
}

function clearStringSelection() {
    stringBtns.forEach(b => b.classList.remove('active'));
}

async function initAudio() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        if (!audioContext || audioContext.state === 'closed') {
             audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;

        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);

        isTuning = true;

        updatePitch();
    } catch (err) {
        alert('Microphone access is required to use the tuner. Error: ' + err.message);
    }
}


function autoCorrelate(buf, sampleRate) {
    let SIZE = buf.length;
    let rms = 0;

    for (let i = 0; i < SIZE; i++) {
        let val = buf[i];
        rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return -1;

    let r1 = 0, r2 = SIZE - 1, thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++)
        if (Math.abs(buf[i]) < thres) { r1 = i; break; }
    for (let i = 1; i < SIZE / 2; i++)
        if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; }

    buf = buf.slice(r1, r2);
    SIZE = buf.length;

    let c = new Array(SIZE).fill(0);
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE - i; j++) {
            c[i] = c[i] + buf[j] * buf[j + i];
        }
    }

    let d = 0; while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < SIZE; i++) {
        if (c[i] > maxval) {
            maxval = c[i];
            maxpos = i;
        }
    }
    let T0 = maxpos;

    let x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    let a = (x1 + x3 - 2 * x2) / 2;
    let b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);

    return sampleRate / T0;
}

function calculateCentsOff(frequency, targetFrequency) {
    return Math.floor(1200 * Math.log(frequency / targetFrequency) / Math.log(2));
}

function findClosestString(frequency) {
    let minCents = Infinity;
    let closestString = currentStrings[0];

    for (let string of currentStrings) {
        const cents = Math.abs(calculateCentsOff(frequency, string.frequency));
        if (cents < minCents) {
            minCents = cents;
            closestString = string;
        }
    }
    return closestString;
}

function updatePitch() {
    if (!isTuning) return;

    let buffer = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buffer);
    let pitch = autoCorrelate(buffer, audioContext.sampleRate);

    if (pitch !== -1) {
        tunerBall.classList.add('active');

        let targetString;

        if (isAutoMode) {

            targetString = findClosestString(pitch);

            highlightStringBtn(targetString.id);
        } else {

            targetString = manualTargetString;
        }

        const cents = calculateCentsOff(pitch, targetString.frequency);


        currentNoteDisplay.innerText = targetString.name;
        exactFrequencyDisplay.innerText = pitch.toFixed(1) + ' Hz';


        if (Math.abs(cents) <= 5) {
            currentCentsDisplay.innerText = "Perfect";
            currentCentsDisplay.style.color = "var(--color-perfect)";
        } else if (cents < 0) {
            currentCentsDisplay.innerText = "Too Low";
            currentCentsDisplay.style.color = "var(--color-off)";
        } else {
            currentCentsDisplay.innerText = "Too High";
            currentCentsDisplay.style.color = "var(--color-off)";
        }

        const clampCents = Math.max(-50, Math.min(50, cents));
        const degrees = (clampCents / 50) * 90;

        tunerBall.style.transform = `rotate(${degrees}deg) translateY(-85px)`;


        if (Math.abs(cents) <= 5) {
            tunerBall.classList.add('perfect');
            targetCircle.classList.add('perfect');
            document.querySelector(`.string-btn[data-string="${targetString.id}"]`).style.color = "#000";
        } else {
            tunerBall.classList.remove('perfect');
            targetCircle.classList.remove('perfect');
            document.querySelector(`.string-btn[data-string="${targetString.id}"]`).style.color = "#fff";
        }

    } else {

        tunerBall.classList.remove('active');
        currentCentsDisplay.innerText = "Listening...";
        currentCentsDisplay.style.color = "var(--text-muted)";
        exactFrequencyDisplay.innerText = "-- Hz";

        if (isAutoMode) {
            clearStringSelection();
            currentNoteDisplay.innerText = "-";
            targetCircle.classList.remove('perfect');
        }
    }

    requestAnimationFrame(updatePitch);
}