// 1. THEME SWITCHER
const themeBtn = document.getElementById('theme-btn');
themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
});

// 2. STEALTH MODE
const stealthToggle = document.getElementById('stealthToggle');
stealthToggle.addEventListener('change', () => {
    if (stealthToggle.checked) {
        document.body.classList.add('stealth-active');
        document.title = "Weather Update";
    } else {
        document.body.classList.remove('stealth-active');
        document.title = "SafeNova";
    }
    updateStatus();
});

// 3. GESTURE DETECTION (Shake)
const gestureToggle = document.getElementById('gestureToggle');
gestureToggle.addEventListener('change', async () => {
    if (gestureToggle.checked) {
        // Essential for iOS 13+ and some Androids
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            const permission = await DeviceMotionEvent.requestPermission();
            if (permission !== 'granted') {
                alert("Permission for sensors denied.");
                gestureToggle.checked = false;
                return;
            }
        }
        window.addEventListener('devicemotion', handleShake);
    } else {
        window.removeEventListener('devicemotion', handleShake);
    }
    updateStatus();
});

function handleShake(event) {
    let acc = event.accelerationIncludingGravity;
    let threshold = 25; // Change to 35 if it triggers too easily
    if (Math.abs(acc.x) > threshold || Math.abs(acc.y) > threshold) {
        alert("🚨 GESTURE SOS TRIGGERED!");
    }
}

// 4. VOICE SOS
const voiceToggle = document.getElementById('voiceToggle');
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = true;

voiceToggle.addEventListener('change', () => {
    if (voiceToggle.checked) recognition.start();
    else recognition.stop();
    updateStatus();
});

recognition.onresult = (event) => {
    const text = event.results[event.results.length - 1][0].transcript.toLowerCase();
    if (text.includes("help")) alert("🚨 VOICE SOS TRIGGERED!");
};

// 5. TOUCH FLASH & STATUS
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
        card.classList.add('flash-effect');
        setTimeout(() => card.classList.remove('flash-effect'), 400);
    });
});

function updateStatus() {
    const active = document.querySelectorAll('input:checked').length;
    const bar = document.getElementById('status-bar');
    if (active > 0) {
        bar.innerText = "SYSTEM ARMED";
        bar.classList.add('status-on');
    } else {
        bar.innerText = "SYSTEM DISARMED";
        bar.classList.remove('status-on');
    }
}