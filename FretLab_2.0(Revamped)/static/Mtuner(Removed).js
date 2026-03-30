let currentAudio = null;
let currentBtn = null;

function playAudio(file, element) {

    if (currentAudio && currentBtn === element) {
        stopAudio();
        return;
    }


    stopAudio();


    currentAudio = new Audio(file);
    currentBtn = element;

    currentAudio.play().catch(error => {
        console.error("Audio file not found at:", file);
    });


    element.classList.add('playing');


    currentAudio.onended = () => {
        stopAudio();
    };
}

function stopAudio() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
    if (currentBtn) {
        currentBtn.classList.remove('playing');
        currentBtn = null;
    }
}