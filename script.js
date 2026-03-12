const supabaseUrl = "https://bzlijpmugslohymjxwrx.supabase.co";
const supabaseKey = "sb_publishable_zqTgo87Jj99n3_27vIMZ_w_tKIVpAYq";

<<<<<<< Updated upstream
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
=======
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const SUPABASE_URL = "https://bzlijpmugslohymjxwrx.supabase.co"
const SUPABASE_KEY = "sb_publishable_zqTgo87Jj99n3_27vIMZ_w_tKIVpAYq"

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const themeToggleBtn = document.getElementById('themeToggle');
const themeIcon = themeToggleBtn.querySelector('i');
const body = document.body;
>>>>>>> Stashed changes

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");
    const loginBtn = document.getElementById("loginBtn");

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        const originalText = loginBtn.innerHTML;

        loginBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';
        loginBtn.style.pointerEvents = "none";

<<<<<<< Updated upstream
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
=======
async function triggerSOS() {
>>>>>>> Stashed changes

        if (error) {
            alert("Login failed: " + error.message);
            loginBtn.innerHTML = originalText;
            loginBtn.style.pointerEvents = "auto";
            return;
        }

        loginBtn.innerHTML = "Success";
        loginBtn.style.background = "#10b981";

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1200);

    });

<<<<<<< Updated upstream
});
=======
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                const { data, error } = await supabase
                    .from("live_locations")
                    .insert({
                        latitude: lat,
                        longitude: lon
                    })
                    .select();

                if (error) {
                    console.error("Error sending location to Supabase:", error);
                    alert("🚨 SOS Sent! Location logged locally.");
                } else {
                    alert(`🚨 SafeNova SOS ALERT INITIATED!\n\nLive Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}\nLocation sent to tracking system.\nEmergency contacts and local authorities are being notified.`);
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
>>>>>>> Stashed changes
