document.addEventListener('DOMContentLoaded', () => {
    // Login form handling
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = loginForm.querySelector('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Initializing...';
            btn.disabled = true;

            // Ask for microphone permissions implicitly via a quick dummy request
            // Ask for geolocation
            try {
                // We don't block login if they fail, but we try to request them
                await requestPermissions();
            } catch (err) {
                console.warn("Permissions not fully granted, some features might be limited.", err);
            }

            // Simulate login process
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        });
    }
});

async function requestPermissions() {
    // Quick mic check
    try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // stop it immediately so we don't hold the mic
            stream.getTracks().forEach(track => track.stop());
        }
    } catch(e) {
        console.error("Mic permission denied:", e);
    }
    
    // Request location
    return new Promise((resolve) => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => resolve(true),
                (err) => resolve(false),
                { timeout: 5000 }
            );
        } else {
            resolve(false);
        }
    });
}
