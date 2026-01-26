let currentAudio = null;
let currentBtn = null;

function playAudio(file, element) {
    // If the same button is clicked while playing, stop it
    if (currentAudio && currentBtn === element) {
        stopAudio();
        return;
    }

    // Stop any existing audio before playing new one
    stopAudio();

    // Create and play new sound
    currentAudio = new Audio(file);
    currentBtn = element;

    currentAudio.play().catch(error => {
        console.error("Audio file not found at:", file);
    });

    // Add visual state
    element.classList.add('playing');
    
    // Cleanup when audio ends
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