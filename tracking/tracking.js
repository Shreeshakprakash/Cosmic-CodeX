import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const SUPABASE_URL = "https://bzlijpmugslohymjxwrx.supabase.co"
const SUPABASE_KEY = "sb_publishable_zqTgo87Jj99n3_27vIMZ_w_tKIVpAYq"

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

let map
let marker


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

    // Get the most recent location
    const { data, error } = await supabase
        .from("live_locations")
        .select("*")
        .order("time", { ascending: false })
        .limit(1)
        .single()

    if (data) {

        initMap(data.latitude, data.longitude)

    }

}

loadLocation()

supabase
    .channel("live-tracking")

    .on(
        "postgres_changes",
        {
            event: "UPDATE",
            schema: "public",
            table: "live_locations"
        },

        (payload) => {

            const lat = payload.new.latitude
            const lon = payload.new.longitude

            console.log("Location updated:", lat, lon)

            initMap(lat, lon)

        }

    )

    .subscribe()