import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const SUPABASE_URL = "https://bzlijpmugslohymjxwrx.supabase.co"
const SUPABASE_KEY = "sb_publishable_zqTgo87Jj99n3_27vIMZ_w_tKIVpAYq"

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

let map
let marker

// Get user ID from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const trackingUserId = urlParams.get('user');

function initMap(lat, lon) {

    const location = [lat, lon]

    if (!map) {

        map = L.map("map").setView(location, 15)

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap"
        }).addTo(map)

        marker = L.marker(location).addTo(map)

    } else {

        marker.setLatLng(location)
        map.setView(location)

    }

}


async function loadLocation() {

    let query = supabase
        .from("live_locations")
        .select("*")
        .order("time", { ascending: false });

    // If user ID is provided, filter by that user; otherwise show most recent
    if (trackingUserId) {
        query = query.eq("user_id", trackingUserId);
    }

    const { data, error } = await query.limit(1).single();

    if (data) {
        initMap(data.latitude, data.longitude);
        
        // Update status
        const statusEl = document.getElementById('trackingStatus');
        const statusPill = document.getElementById('statusPill');
        if (statusEl) {
            statusEl.textContent = trackingUserId ? 'Tracking user in real time' : 'Tracking most recent location';
            if (statusPill) statusPill.classList.remove('danger');
        }
    } else if (error) {
        console.error("Error loading location:", error);
        const statusEl = document.getElementById('trackingStatus');
        const statusPill = document.getElementById('statusPill');
        if (statusEl) {
            statusEl.textContent = 'No location data available';
            if (statusPill) statusPill.classList.add('danger');
        }
    }

}

loadLocation()

// Set up real-time subscription
let channel = supabase.channel("live-tracking");

// Subscribe to INSERT events (new locations)
channel.on(
    "postgres_changes",
    {
        event: "INSERT",
        schema: "public",
        table: "live_locations"
    },
    (payload) => {
        // Filter by user if specified
        if (!trackingUserId || payload.new.user_id === trackingUserId) {
            const lat = payload.new.latitude;
            const lon = payload.new.longitude;

            console.log("Location updated:", lat, lon);
            initMap(lat, lon);
        }
    }
);

// Subscribe to UPDATE events as well
channel.on(
    "postgres_changes",
    {
        event: "UPDATE",
        schema: "public",
        table: "live_locations"
    },
    (payload) => {
        // Filter by user if specified
        if (!trackingUserId || payload.new.user_id === trackingUserId) {
            const lat = payload.new.latitude;
            const lon = payload.new.longitude;

            console.log("Location updated:", lat, lon);
            initMap(lat, lon);
        }
    }
);

channel.subscribe();