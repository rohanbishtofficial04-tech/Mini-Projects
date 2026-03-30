class Metronome {
    constructor() {
        this.audioCtx = null;
        this.nextNoteTime = 0.0;
        this.bpm = 120;
        this.isPlaying = false;
        this.beat = 0;
        this.beatsPerMeasure = 4;
        this.timerID = null;
    }

    scheduler() {
        while (this.nextNoteTime < this.audioCtx.currentTime + 0.1) {
            this.playClick(this.nextNoteTime, this.beat);
            this.advanceNote();
        }
    }

    advanceNote() {
        const secondsPerBeat = 60.0 / this.bpm;
        this.nextNoteTime += secondsPerBeat;
        this.beat = (this.beat + 1) % this.beatsPerMeasure;
    }

    playClick(time, beatNumber) {
        const osc = this.audioCtx.createOscillator();
        const envelope = this.audioCtx.createGain();


        osc.frequency.value = beatNumber === 0 ? 1000 : 600;

        envelope.gain.setValueAtTime(1, time);
        envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

        osc.connect(envelope);
        envelope.connect(this.audioCtx.destination);

        osc.start(time);
        osc.stop(time + 0.03);


        const delay = Math.max(0, (time - this.audioCtx.currentTime) * 1000);
        setTimeout(() => updateVisuals(beatNumber), delay);
    }

    toggle() {
        if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.isPlaying = !this.isPlaying;

        if (this.isPlaying) {
            this.beat = 0;
            this.nextNoteTime = this.audioCtx.currentTime + 0.05;
            this.timerID = setInterval(() => this.scheduler(), 25);
            return "Stop";
        } else {
            clearInterval(this.timerID);
            resetDots();
            return "Start";
        }
    }
}

const engine = new Metronome();
const startStopBtn = document.getElementById('start-stop');
const bpmSlider = document.getElementById('bpm-slider');
const bpmHero = document.getElementById('bpm-hero');
const indicators = document.getElementById('indicators');
const timeSig = document.getElementById('time-sig');
const tapBtn = document.getElementById('tap-btn');

function drawDots() {
    indicators.innerHTML = '';
    for (let i = 0; i < engine.beatsPerMeasure; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        indicators.appendChild(dot);
    }
}

function updateVisuals(beat) {
    const dots = document.querySelectorAll('.dot');
    dots.forEach(d => d.classList.remove('active'));
    if (dots[beat]) dots[beat].classList.add('active');
}

function resetDots() {
    document.querySelectorAll('.dot').forEach(d => d.classList.remove('active'));
}


startStopBtn.addEventListener('click', () => {
    const state = engine.toggle();
    startStopBtn.innerText = state;
    startStopBtn.classList.toggle('playing');
});

timeSig.addEventListener('change', (e) => {
    engine.beatsPerMeasure = parseInt(e.target.value);
    engine.beat = 0;
    drawDots();
});

bpmSlider.addEventListener('input', () => {
    engine.bpm = bpmSlider.value;
    bpmHero.innerText = bpmSlider.value;
});

document.getElementById('minus').onclick = () => { bpmSlider.value--; bpmSlider.dispatchEvent(new Event('input')); };
document.getElementById('plus').onclick = () => { bpmSlider.value++; bpmSlider.dispatchEvent(new Event('input')); };


let taps = [];
tapBtn.onclick = () => {
    const now = Date.now();
    taps.push(now);
    if (taps.length > 4) taps.shift();
    if (taps.length > 1) {
        const intervals = [];
        for(let i=1; i<taps.length; i++) intervals.push(taps[i] - taps[i-1]);
        const avg = intervals.reduce((a, b) => a + b) / intervals.length;
        const tappedBpm = Math.round(60000 / avg);
        if (tappedBpm >= 40 && tappedBpm <= 240) {
            bpmSlider.value = tappedBpm;
            bpmSlider.dispatchEvent(new Event('input'));
        }
    }
};


drawDots();