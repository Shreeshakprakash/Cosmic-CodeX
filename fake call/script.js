document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const setupScreen = document.getElementById('setup-screen');
    const ringingScreen = document.getElementById('ringing-screen');
    const activeScreen = document.getElementById('active-screen');
    const ringtone = document.getElementById('ringtone-audio');

    const scheduleBtn = document.getElementById('schedule-btn');
    const acceptBtn = document.getElementById('accept-btn');
    const declineBtn = document.getElementById('decline-btn');
    const endBtn = document.getElementById('end-btn');

    let callInterval;

    const urlParams = new URLSearchParams(window.location.search);
    const callerFromUrl = urlParams.get('caller');
    const autoStart = urlParams.get('autostart') === '1';
    const delayFromUrl = parseInt(urlParams.get('delay') || '3', 10);

    if (callerFromUrl) {
        document.getElementById('caller-name').value = callerFromUrl;
    }

    if (!Number.isNaN(delayFromUrl) && delayFromUrl > 0) {
        document.getElementById('call-delay').value = String(delayFromUrl);
    }

    // 1. Schedule Function
    scheduleBtn.addEventListener('click', () => {
        const name = document.getElementById('caller-name').value || "Home";
        const delay = parseInt(document.getElementById('call-delay').value) * 1000;

        // Update Display Names
        document.getElementById('display-name').innerText = name;
        document.getElementById('active-name').innerText = name;

        scheduleBtn.innerText = "Standby Mode...";
        scheduleBtn.style.background = "#555";

        // Logic to trigger call after delay
        setTimeout(() => {
            triggerRinging();
        }, delay);
    });

    if (autoStart) {
        setTimeout(() => {
            scheduleBtn.click();
        }, 300);
    }

    // 2. Ringing Logic
    function triggerRinging() {
        switchScreen(ringingScreen);
        ringtone.play().catch(e => console.log("Audio play blocked: ", e));
        
        // Vibrate mobile device
        if ("vibrate" in navigator) {
            navigator.vibrate([1000, 500, 1000, 500, 1000]);
        }
    }

    // 3. Accept Logic
    acceptBtn.addEventListener('click', () => {
        ringtone.pause();
        ringtone.currentTime = 0;
        if ("vibrate" in navigator) navigator.vibrate(0); // Stop vibration
        
        switchScreen(activeScreen);
        startTimer();
    });

    // 4. Decline/Hangup Logic
    const endCall = () => {
        ringtone.pause();
        ringtone.currentTime = 0;
        clearInterval(callInterval);
        if ("vibrate" in navigator) navigator.vibrate(0);
        
        document.getElementById('call-timer').innerText = "00:00";
        switchScreen(setupScreen);
        
        scheduleBtn.innerText = "Activate Timer";
        scheduleBtn.style.background = "#4cd964";
    };

    declineBtn.addEventListener('click', endCall);
    endBtn.addEventListener('click', endCall);

    // Utilities
    function switchScreen(target) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        target.classList.add('active');
    }

    function startTimer() {
        let sec = 0;
        callInterval = setInterval(() => {
            sec++;
            let m = Math.floor(sec / 60);
            let s = sec % 60;
            document.getElementById('call-timer').innerText = 
                `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }, 1000);
    }
});