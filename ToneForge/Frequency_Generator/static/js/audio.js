const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

let oscillator = null;
let gainNode = audioCtx.createGain();
let panNode = audioCtx.createStereoPanner();

gainNode.connect(panNode).connect(audioCtx.destination);

let currentFreq = 440;
let isPlaying = false;

const freqText   = document.getElementById("freqValue");
const freqSlider = document.getElementById("freqSlider");
const playBtn    = document.getElementById("playBtn");

updateFrequency();

// play / pause
playBtn.addEventListener("click", () => {
    if (!isPlaying) {
        oscillator = audioCtx.createOscillator();
        oscillator.type = currentWaveform;
        oscillator.frequency.value = currentFreq;
        oscillator.connect(gainNode);
        oscillator.start();
        isPlaying = true;
        playBtn.innerText = "❚❚";
    } else {
        oscillator.stop();
        oscillator.disconnect();
        oscillator = null;
        isPlaying = false;
        playBtn.innerText = "▶";
    }
});

// freq ctrl
function changeFreq(step) {
    currentFreq = Math.min(22000, Math.max(1, currentFreq + step));
    updateFrequency();
}

freqSlider.addEventListener("input", () => {
    currentFreq = parseFloat(freqSlider.value);
    updateFrequency();
});

function updateFrequency() {
    freqText.innerText = currentFreq.toFixed(2);
    freqSlider.value = currentFreq;
    if (oscillator) {
        oscillator.frequency.setValueAtTime(currentFreq, audioCtx.currentTime);
    }
}

// Manual Frequency Input
freqText.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "number";
    input.min = 1;
    input.max = 22000;
    input.step = "0.01";
    input.value = currentFreq.toFixed(2);
    input.style.fontSize = "32px";
    input.style.width = "150px";
    input.style.textAlign = "center";

    freqText.replaceWith(input);
    input.focus();

    function apply() {
        const v = parseFloat(input.value);
        if (!isNaN(v)) {
            currentFreq = Math.min(22000, Math.max(1, v));
            updateFrequency();
        }
        input.replaceWith(freqText);
    }

    input.addEventListener("blur", apply);
    input.addEventListener("keydown", e => {
        if (e.key === "Enter") apply();
    });
});

let currentVolume = 1.0;
let currentPan = 0;
let currentWaveform = "sine";

function openVolume() {
    openModal("volumeModal");
}

function setVolume(val) {
    currentVolume = val;
    gainNode.gain.value = val;
}

function openPan() {
    openModal("panModal");
}

function setPan(val) {
    currentPan = val;
    panNode.pan.value = val;
}

function openWaveform() {
    openModal("waveModal");
}

function setWaveform(type) {
    currentWaveform = type;
    if (oscillator) oscillator.type = type;
}

// Musical Notes
const notes = [];
const noteNames = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const A4 = 440;

outer:
for (let octave = 0; octave <= 10; octave++) {
    for (let i = 0; i < noteNames.length; i++) {
        const note = noteNames[i] + octave;
        const semitone = (octave - 4) * 12 + (i - 9);
        const freq = A4 * Math.pow(2, semitone / 12);

        notes.push({ name: note, freq: freq.toFixed(2) });
        if (note === "E10") break outer;
    }
}

// Notes Modal
function openNotes() {
    renderNotes("");
    openModal("notesModal");
}

// ✅ FIXED FILTER (case-insensitive)
function renderNotes(filter) {
    const list = document.getElementById("notesList");
    list.innerHTML = "";

    notes.forEach(n => {
        if (!filter || n.name.toLowerCase().startsWith(filter.toLowerCase())) {
            const div = document.createElement("div");
            div.className = "note-item";
            div.innerText = `${n.name} — ${n.freq} Hz`;
            div.onclick = () => {
                currentFreq = parseFloat(n.freq);
                updateFrequency();
                closeModal();
            };
            list.appendChild(div);
        }
    });
}

// ✅ FILTER INPUT WIRING (THIS WAS MISSING)
const noteFilter = document.getElementById("noteFilter");
noteFilter.addEventListener("input", () => {
    renderNotes(noteFilter.value);
});

function openModal(id) {
    closeModal();
    document.getElementById(id).style.display = "block";
}

function closeModal() {
    document.querySelectorAll(".modal").forEach(m => m.style.display = "none");
}

document.body.addEventListener("click", () => {
    if (audioCtx.state !== "running") {
        audioCtx.resume();
    }
}, { once: true });

// Keyboard Controls
document.addEventListener("keydown", (e) => {
    switch (e.key) {
        case " ":
            e.preventDefault();
            if (!isPlaying) {
                oscillator = audioCtx.createOscillator();
                oscillator.type = currentWaveform;
                oscillator.frequency.value = currentFreq;
                oscillator.connect(gainNode);
                oscillator.start();
                isPlaying = true;
                playBtn.innerText = "❚❚";
            } else {
                oscillator.stop();
                oscillator.disconnect();
                oscillator = null;
                isPlaying = false;
                playBtn.innerText = "▶";
            }
            break;

        case "ArrowUp":
            e.preventDefault();
            currentVolume = Math.min(1, currentVolume + 0.05);
            gainNode.gain.value = currentVolume;
            break;

        case "ArrowDown":
            e.preventDefault();
            currentVolume = Math.max(0, currentVolume - 0.05);
            gainNode.gain.value = currentVolume;
            break;

        case "ArrowRight":
            e.preventDefault();
            changeFreq(1);
            break;

        case "ArrowLeft":
            e.preventDefault();
            changeFreq(-1);
            break;
    }
});
