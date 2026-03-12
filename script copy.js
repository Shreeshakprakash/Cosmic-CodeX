
const themeToggleBtn = document.getElementById('themeToggle');
const themeIcon = themeToggleBtn.querySelector('i');
const body = document.body;


const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
    body.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    }
}

themeToggleBtn.addEventListener('click', () => {
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        themeIcon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'dark');
    }
});



const sosButton = document.getElementById('sosButton');

sosButton.addEventListener('click', function () {
    triggerSOS();
});

function triggerSOS() {

    if (navigator.vibrate) {
        navigator.vibrate([400, 100, 400, 100, 400]);
    }


    sosButton.textContent = "SENDING";
    sosButton.style.background = "#e0352b";


    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                alert(`🚨 SafeNova SOS ALERT INITIATED!\n\nLive Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}\nEmergency contacts and local authorities are being notified.`);

                console.log("SOS triggered at:", lat, lon);
                resetButton();
            },
            (error) => {
                alert("🚨 SOS Sent! Location access denied or unavailable. Notifying contacts via last known location.");
                resetButton();
            }
        );
    } else {
        alert("🚨 Geolocation not supported. Sending basic emergency signal...");
        resetButton();
    }
}

function resetButton() {
    setTimeout(() => {
        sosButton.textContent = "SOS";
        sosButton.style.background = "#e0352b";
    }, 30000);
}


const cards = document.querySelectorAll('.action-card');

cards[0].addEventListener('click', () => alert("Connecting to Emergency Services (911/112)..."));
cards[1].addEventListener('click', () => alert("Calculating safest route home..."));
cards[2].addEventListener('click', () => alert("Live tracking link generated. Ready to share."));