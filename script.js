
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const SUPABASE_URL = "https://bzlijpmugslohymjxwrx.supabase.co"
const SUPABASE_KEY = "sb_publishable_zqTgo87Jj99n3_27vIMZ_w_tKIVpAYq"

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ========================
// AUTHENTICATION & USER SESSION
// ========================

let currentUser = null;

async function checkAuthentication() {
    const userId = localStorage.getItem('safenova_user_id');
    const userEmail = localStorage.getItem('safenova_user_email');

    console.log("Checking authentication - userId:", userId, "email:", userEmail);

    if (!userId) {
        // Not logged in - allow guest access
        console.log("Guest mode - no authentication required");
        displayUserInfo();
        return;
    }

    try {
        // Verify session with Supabase
        const { data: { session }, error } = await supabase.auth.getSession();

        console.log("Supabase session check:", session ? "Valid session" : "No session", error ? `Error: ${error.message}` : "");

        if (error) {
            console.error("Session error:", error);
            // Keep the local session, don't clear it
        }

        // If we have a valid session or localStorage, fetch profile
        if (session || userId) {
            // Fetch user profile from database
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            console.log("Profile fetch result:", profile ? "Found" : "Not found", profileError ? `Error: ${profileError.message}` : "");

            if (profile) {
                currentUser = {
                    id: userId,
                    email: userEmail,
                    name: profile.name || userEmail.split('@')[0]
                };
            } else {
                currentUser = {
                    id: userId,
                    email: userEmail,
                    name: userEmail.split('@')[0]
                };
            }

            console.log("Current user set:", currentUser);

            // Update UI to show user info
            displayUserInfo();
        }
    } catch (err) {
        console.error("Authentication check error:", err);
        // Don't clear session on error, just continue
        displayUserInfo();
    }
}

function displayUserInfo() {
    const userInfo = document.getElementById('userInfo');
    const loginNavBtn = document.getElementById('loginNavBtn');
    const userName = document.getElementById('userName');

    console.log("displayUserInfo called - currentUser:", currentUser);
    console.log("DOM elements - userInfo:", !!userInfo, "loginNavBtn:", !!loginNavBtn, "userName:", !!userName);

    if (currentUser) {
        if (userName) userName.textContent = currentUser.name;
        if (userInfo) userInfo.style.display = 'flex';
        if (loginNavBtn) loginNavBtn.style.display = 'none';
        console.log("UI updated: Showing user info for", currentUser.name);
    } else {
        // Guest mode - show login button
        if (userInfo) userInfo.style.display = 'none';
        if (loginNavBtn) loginNavBtn.style.display = 'block';
        console.log("UI updated: Showing login button (guest mode)");
    }
}

async function logout() {
    // Sign out from Supabase
    await supabase.auth.signOut();

    // Clear local storage
    localStorage.removeItem('safenova_user_id');
    localStorage.removeItem('safenova_user_email');

    // Redirect to login
    window.location.href = 'login/login.html';
}

// Check authentication on page load
window.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, checking authentication...");
    checkAuthentication();
});

// Also check immediately in case DOMContentLoaded already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log("Document already loaded, checking authentication...");
    checkAuthentication();
}

// Logout button event listener
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        const confirm = window.confirm('Are you sure you want to logout?');
        if (confirm) {
            logout();
        }
    });
}

// ========================
// THEME TOGGLE
// ========================

const themeToggleBtn = document.getElementById('themeToggle');
const themeIcon = themeToggleBtn.querySelector('i');
const body = document.body;
const voiceSosToggle = document.getElementById('voiceSosToggle');
const voiceSosStatus = document.getElementById('voiceSosStatus');
const SpeechRecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition;
const VOICE_SOS_PREF_KEY = 'safenova_voice_sos_enabled';

let voiceRecognition = null;
let isVoiceSosEnabled = false;
let isSosInProgress = false;


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

async function triggerSOS() {
    if (isSosInProgress) {
        return;
    }

    isSosInProgress = true;

    if (navigator.vibrate) {
        navigator.vibrate([400, 100, 400, 100, 400]);
    }


    sosButton.textContent = "SENDING";
    sosButton.style.background = "#e0352b";


    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                // Use user ID if logged in, otherwise use null (guest mode)
                const userId = currentUser?.id || localStorage.getItem('safenova_user_id') || null;

                const { data, error } = await supabase
                    .from("live_locations")
                    .insert({
                        user_id: userId,
                        latitude: lat,
                        longitude: lon
                    })
                    .select();

                if (error) {
                    console.error("Error sending location to Supabase:", error);
                    alert("🚨 SOS Sent! Location logged locally.");
                } else {
                    await notifyTrustedContactWithLiveLink(lat, lon);
                    alert(`🚨 SafeNova SOS ALERT INITIATED!\n\nLive Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}\nLocation sent to tracking system.\nEmergency contacts are being notified.`);
                    console.log("SOS triggered and sent to Supabase:", lat, lon);
                }

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

async function getTrustedContactsForAlerts() {
    const userId = currentUser?.id || localStorage.getItem('safenova_user_id');
    if (!userId) {
        return [];
    }

    const { data, error } = await supabase
        .from('emergency_contacts')
        .select('id, contact_name, phone')
        .eq('user_id', userId)
        .limit(5);

    if (!error && data && data.length > 0) {
        return data.map((contact) => ({
            id: contact.id,
            name: contact.contact_name || 'Unknown',
            phone: contact.phone || ''
        }));
    }

    const localContacts = JSON.parse(localStorage.getItem(`safenova_contacts_${userId}`) || '[]');
    return Array.isArray(localContacts) ? localContacts : [];
}

function normalizePhone(phone) {
    if (!phone) return '';
    return String(phone).replace(/[^\d+]/g, '');
}

async function notifyTrustedContactWithLiveLink(lat, lon) {
    const contacts = await getTrustedContactsForAlerts();
    if (!contacts.length) {
        return;
    }

    const userId = currentUser?.id || localStorage.getItem('safenova_user_id');
    const trackingUrl = userId
        ? `${window.location.origin}/tracking/tracking.html?user=${userId}`
        : `${window.location.origin}/tracking/tracking.html`;

    const targetContact = contacts[0];
    const phone = normalizePhone(targetContact.phone);
    const message = `SafeNova SOS Alert! ${currentUser?.name || 'User'} may need help. Live location: ${trackingUrl}`;

    if (phone) {
        const smsLink = `sms:${phone}?body=${encodeURIComponent(message)}`;
        window.open(smsLink, '_blank');
        console.log('SOS live link prepared for trusted contact:', targetContact.name);
    }

    try {
        await navigator.clipboard.writeText(`${message}`);
    } catch (error) {
        console.log('Clipboard unavailable for SOS live link message.');
    }
}

function resetButton() {
    setTimeout(() => {
        sosButton.textContent = "SOS";
        sosButton.style.background = "#e0352b";
        isSosInProgress = false;
    }, 30000);
}

function updateVoiceSosUi(message, listening = false) {
    if (!voiceSosToggle || !voiceSosStatus) {
        return;
    }

    voiceSosToggle.classList.toggle('is-listening', listening);
    voiceSosToggle.innerHTML = listening
        ? '<i class="fa-solid fa-microphone-lines"></i><span>Disable Voice SOS</span>'
        : '<i class="fa-solid fa-microphone"></i><span>Enable Voice SOS</span>';
    voiceSosStatus.textContent = message;
}

function stopVoiceSosListening(manual = false) {
    isVoiceSosEnabled = false;

    if (manual) {
        localStorage.setItem(VOICE_SOS_PREF_KEY, 'false');
    }

    if (voiceRecognition) {
        voiceRecognition.onend = null;
        voiceRecognition.stop();
        voiceRecognition = null;
    }

    updateVoiceSosUi(
        manual ? 'Voice SOS is off' : 'Voice SOS stopped',
        false
    );
}

function startVoiceSosListening(userInitiated = false) {
    if (!SpeechRecognitionApi) {
        updateVoiceSosUi('Voice recognition is not supported in this browser.', false);
        return;
    }

    if (isVoiceSosEnabled) {
        if (userInitiated) {
            stopVoiceSosListening(true);
        }
        return;
    }

    localStorage.setItem(VOICE_SOS_PREF_KEY, 'true');

    voiceRecognition = new SpeechRecognitionApi();
    voiceRecognition.continuous = true;
    voiceRecognition.interimResults = true;
    voiceRecognition.lang = 'en-US';

    isVoiceSosEnabled = true;
    updateVoiceSosUi('Listening for the word "help"...', true);

    voiceRecognition.onresult = (event) => {
        const transcript = Array.from(event.results)
            .map((result) => result[0].transcript)
            .join(' ')
            .toLowerCase();

        if (/\bhelp\b/.test(transcript)) {
            updateVoiceSosUi('Keyword detected. Activating SOS...', true);
            triggerSOS();
        }
    };

    voiceRecognition.onerror = (event) => {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            isVoiceSosEnabled = false;
            updateVoiceSosUi('Microphone permission was denied. Click to enable voice SOS.', false);
            return;
        }

        if (event.error !== 'no-speech' && event.error !== 'aborted') {
            updateVoiceSosUi('Voice SOS hit an error. Try enabling it again.', false);
        }
    };

    voiceRecognition.onend = () => {
        if (!isVoiceSosEnabled) {
            return;
        }

        try {
            voiceRecognition.start();
        } catch (error) {
            updateVoiceSosUi('Voice SOS could not restart. Try again.', false);
            isVoiceSosEnabled = false;
        }
    };

    try {
        voiceRecognition.start();
    } catch (error) {
        isVoiceSosEnabled = false;
        updateVoiceSosUi(
            userInitiated
                ? 'Voice SOS could not start. Try again.'
                : 'Voice SOS is set to on. If your browser blocks auto-start, tap the button once.',
            false
        );
    }
}

function initializeVoiceSos() {
    const savedPreference = localStorage.getItem(VOICE_SOS_PREF_KEY);
    const shouldEnableVoiceSos = savedPreference !== 'false';

    if (shouldEnableVoiceSos) {
        startVoiceSosListening(false);
    } else {
        updateVoiceSosUi('Voice SOS is off', false);
    }
}

if (voiceSosToggle) {
    voiceSosToggle.addEventListener('click', () => startVoiceSosListening(true));
}

initializeVoiceSos();


const cards = document.querySelectorAll('.action-card');


cards[0].addEventListener('click', () => {
    window.location.href = "tel:911";
});

cards[1].addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                let homeAddress = localStorage.getItem('homeAddress');

                if (!homeAddress) {
                    homeAddress = prompt("Enter your home address for navigation:", "");
                    if (homeAddress) {
                        localStorage.setItem('homeAddress', homeAddress);
                    } else {
                        alert("Home address required for navigation.");
                        return;
                    }
                }

                const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lon}&destination=${encodeURIComponent(homeAddress)}&travelmode=driving`;
                window.open(mapsUrl, '_blank');
            },
            (error) => {
                alert("Unable to get your current location. Please enable location services.");
            }
        );
    } else {
        alert("Geolocation not supported by your browser.");
    }
});


cards[2].addEventListener('click', () => {
    // Check if user is logged in
    const userId = currentUser?.id || localStorage.getItem('safenova_user_id');

    if (!userId) {
        alert("⚠️ Login Required\n\nPlease login to generate a personalized tracking link.\n\nYou can still use SOS features as a guest.");
        return;
    }

    // Generate shareable tracking link
    const trackingUrl = `${window.location.origin}/tracking/tracking.html?user=${userId}`;

    // Copy to clipboard
    navigator.clipboard.writeText(trackingUrl).then(() => {
        alert(`📍 Live Tracking Link Generated!\n\n${trackingUrl}\n\nLink copied to clipboard! Share it with your trusted contacts.`);
    }).catch(() => {
        alert(`📍 Live Tracking Link Generated!\n\n${trackingUrl}\n\nCopy this link to share your live location.`);
    });
});


// ========================
// SAFETY TIMER (Dead-Man Switch)
// ========================

let safetyTimerInterval = null;
let safetyTimerTimeout = null;
let remainingSeconds = 0;
let liveTrackingInterval = null;
let isLiveTrackingActive = false;

const timerControls = document.getElementById('timerControls');
const timerDisplay = document.getElementById('timerDisplay');
const countdownText = document.getElementById('countdownText');
const cancelTimerBtn = document.getElementById('cancelTimerBtn');
const timerOptionBtns = document.querySelectorAll('.timer-option-btn');
const customTimerInput = document.getElementById('customTimerInput');
const customTimerBtn = document.getElementById('customTimerBtn');
const liveTrackingStatus = document.getElementById('liveTrackingStatus');
const stopTrackingBtn = document.getElementById('stopTrackingBtn');

// Add click listeners to timer option buttons
timerOptionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const minutes = parseInt(btn.getAttribute('data-minutes'));
        startSafetyTimer(minutes);
    });
});

// Custom timer button
customTimerBtn.addEventListener('click', () => {
    const minutes = parseInt(customTimerInput.value);

    if (!minutes || minutes < 1 || minutes > 120) {
        alert("Please enter a valid time between 1 and 120 minutes.");
        return;
    }

    startSafetyTimer(minutes);
    customTimerInput.value = ''; // Clear input after starting
});

// Allow Enter key to start custom timer
customTimerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        customTimerBtn.click();
    }
});

// Cancel timer button
cancelTimerBtn.addEventListener('click', () => {
    cancelSafetyTimer();
});

// Stop live tracking button
stopTrackingBtn.addEventListener('click', () => {
    stopLiveLocationSharing();
});

function startSafetyTimer(minutes) {
    // Clear any existing timer
    if (safetyTimerInterval) {
        clearInterval(safetyTimerInterval);
    }
    if (safetyTimerTimeout) {
        clearTimeout(safetyTimerTimeout);
    }

    // Set remaining seconds
    remainingSeconds = minutes * 60;

    // Show timer display, hide controls
    timerControls.style.display = 'none';
    timerDisplay.style.display = 'flex';

    // Update countdown display
    updateCountdownDisplay();

    // Start countdown
    safetyTimerInterval = setInterval(() => {
        remainingSeconds--;
        updateCountdownDisplay();

        if (remainingSeconds <= 0) {
            clearInterval(safetyTimerInterval);
            timerExpired();
        }
    }, 1000);

    if (navigator.vibrate) {
        navigator.vibrate(200);
    }
}

function updateCountdownDisplay() {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    countdownText.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function cancelSafetyTimer() {
    // Clear intervals
    clearInterval(safetyTimerInterval);
    clearTimeout(safetyTimerTimeout);

    // Reset display
    timerDisplay.style.display = 'none';
    timerControls.style.display = 'flex';

    alert("✅ Safety timer cancelled successfully.");

    if (navigator.vibrate) {
        navigator.vibrate(100);
    }
}

function timerExpired() {
    // Vibrate to alert user
    if (navigator.vibrate) {
        navigator.vibrate([500, 200, 500, 200, 500]);
    }

    // Show alert
    alert("⚠️ Safety Timer Expired!\n\n🚨 SOS is being activated automatically.\nLive location sharing started.");

    // Trigger SOS
    triggerSOS();

    // Start live location sharing
    startLiveLocationSharing();

    // Reset timer UI
    timerDisplay.style.display = 'none';
    timerControls.style.display = 'flex';
}

function startLiveLocationSharing() {
    if (!navigator.geolocation) {
        console.error("Geolocation not supported");
        return;
    }

    if (isLiveTrackingActive) {
        return; // Already tracking
    }

    isLiveTrackingActive = true;

    // Show live tracking status
    liveTrackingStatus.style.display = 'flex';

    // Send location immediately
    sendLiveLocation();

    // Then send every 30 seconds
    liveTrackingInterval = setInterval(() => {
        sendLiveLocation();
    }, 30000);

    console.log("Live location sharing started due to timer expiration");
}

function stopLiveLocationSharing() {
    if (!isLiveTrackingActive) {
        return;
    }

    // Clear the interval
    if (liveTrackingInterval) {
        clearInterval(liveTrackingInterval);
        liveTrackingInterval = null;
    }

    isLiveTrackingActive = false;

    // Hide live tracking status
    liveTrackingStatus.style.display = 'none';

    alert("✅ Live location sharing stopped.");

    if (navigator.vibrate) {
        navigator.vibrate(100);
    }

    console.log("Live location sharing stopped");
}

async function sendLiveLocation() {
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            // Use user ID if logged in, otherwise use null (guest mode)
            const userId = currentUser?.id || localStorage.getItem('safenova_user_id') || null;

            const { data, error } = await supabase
                .from("live_locations")
                .insert({
                    user_id: userId,
                    latitude: lat,
                    longitude: lon
                })
                .select();

            if (error) {
                console.error("Error sending live location:", error);
            } else {
                console.log("Live location sent:", lat, lon);
            }
        },
        (error) => {
            console.error("Error getting location:", error);
        }
    );
}

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js")
        .then(() => console.log("Service Worker registered"))
        .catch(err => console.log("Service Worker error", err));
}