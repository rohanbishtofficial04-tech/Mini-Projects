const chords = {
    "A": { "Major": [[-1,0],[0,0],[2,1],[2,2],[2,3],[0,0]], "Minor": [[-1,0],[0,0],[2,2],[2,3],[1,1],[0,0]] },
    "B": { "Major": [[-1,0],[2,1],[4,2],[4,3],[4,4],[2,1]], "Minor": [[-1,0],[2,1],[4,3],[4,4],[3,2],[2,1]] },
    "C": { "Major": [[-1,0],[3,3],[2,2],[0,0],[1,1],[0,0]], "Minor": [[-1,0],[3,1],[5,2],[5,3],[4,2],[3,1]] },
    "D": { "Major": [[-1,0],[-1,0],[0,0],[2,1],[3,3],[2,2]], "Minor": [[-1,0],[-1,0],[0,0],[2,2],[3,3],[1,1]] },
    "E": { "Major": [[0,0],[2,2],[2,3],[1,1],[0,0],[0,0]], "Minor": [[0,0],[2,2],[2,3],[0,0],[0,0],[0,0]] },
    "F": { "Major": [[1,1],[3,3],[3,4],[2,2],[1,1],[1,1]], "Minor": [[1,1],[3,3],[3,4],[1,1],[1,1],[1,1]] },
    "G": { "Major": [[3,3],[2,2],[0,0],[0,0],[0,0],[3,4]], "Minor": [[3,1],[5,3],[5,4],[3,1],[3,1],[3,1]] }
};

const stringNames = ["E", "A", "D", "G", "B", "e"];
const frequencies = [82.41, 110.00, 146.83, 196.00, 246.94, 329.63];
const grid = document.getElementById('grid');
const rootSel = document.getElementById('root-selector');
const qualSel = document.getElementById('quality-selector');
const nameDisp = document.getElementById('display-name');

function init() {
    Object.keys(chords).forEach(k => rootSel.add(new Option(k, k)));
    rootSel.value = "C";
    updateQualities();
    rootSel.onchange = () => { updateQualities(); draw(); };
    qualSel.onchange = draw;
    document.getElementById('play-btn').onclick = play;
    draw();
}

function updateQualities() {
    const current = qualSel.value;
    qualSel.innerHTML = '';
    Object.keys(chords[rootSel.value]).forEach(q => qualSel.add(new Option(q, q)));
    qualSel.value = Object.keys(chords[rootSel.value]).includes(current) ? current : "Major";
}

function draw() {
    grid.innerHTML = '';
    const root = rootSel.value;
    const qual = qualSel.value;
    const shape = chords[root][qual];
    nameDisp.innerText = `${root} ${qual}`;


    for(let i=0; i<6; i++) {
        const s = document.createElement('div'); s.className = 'string'; s.style.left = `${i*20}%`; grid.appendChild(s);
        const l = document.createElement('div'); l.className = 'string-label'; l.innerText = stringNames[i]; l.style.left = `${i*20}%`; grid.appendChild(l);
    }

    const fretsOnly = shape.map(n => n[0]).filter(f => f > 0);
    let startOffset = fretsOnly.length && Math.min(...fretsOnly) > 2 ? Math.min(...fretsOnly) : 1;


    for(let i=1; i<=5; i++) {
        const f = document.createElement('div'); f.className = 'fret'; f.style.top = `${i*20}%`; grid.appendChild(f);
    }

    if(startOffset > 1) {
        const fn = document.createElement('div'); fn.className = 'fret-number'; fn.innerText = startOffset + "fr"; grid.appendChild(fn);
    }


    shape.forEach(([fret, finger], i) => {
        const x = i * 20;
        if(fret === -1) {
            const m = document.createElement('div'); m.className = 'marker mute'; m.innerText = '✕'; m.style.left = x + '%'; grid.appendChild(m);
        } else if(fret === 0) {
            const m = document.createElement('div'); m.className = 'marker open'; m.style.left = x + '%'; grid.appendChild(m);
        } else {
            const visFret = fret - (startOffset - 1);
            const d = document.createElement('div'); d.className = 'dot'; d.innerText = finger || '';
            d.style.left = x + '%'; d.style.top = (visFret * 20 - 10) + '%';
            grid.appendChild(d);
        }
    });
}

let audioCtx;
function play() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const shape = chords[rootSel.value][qualSel.value];

    shape.forEach(([fret], i) => {
        if(fret !== -1) {
            const freq = frequencies[i] * Math.pow(2, fret/12);
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'triangle';
            osc.frequency.value = freq;

            const now = audioCtx.currentTime;
            const delay = i * 0.06;

            gain.gain.setValueAtTime(0, now + delay);
            gain.gain.linearRampToValueAtTime(0.2, now + delay + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 1.5);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(now + delay);
            osc.stop(now + delay + 2);
        }
    });
}

init();