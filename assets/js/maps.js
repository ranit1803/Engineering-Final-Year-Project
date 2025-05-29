// Initialize the map
let map = L.map('map').setView([0, 0], 15); // Default center

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let marker = L.marker([0, 0]).addTo(map);

// ThingSpeak API details
const THINGSPEAK_CHANNEL_ID = "CHANNEL_ID"; // Replace with your ThingSpeak channel ID
const THINGSPEAK_API_KEY = "READ_API_KEY"; // Replace with your ThingSpeak read API key
const THINGSPEAK_URL = `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds/last.json?api_key=${THINGSPEAK_API_KEY}`;

// Function to fetch GPS data from ThingSpeak
function fetchGPSData() {
    fetch(THINGSPEAK_URL)
        .then(response => response.json())
        .then(data => {
            let latitude = parseFloat(data.field7);
            let longitude = parseFloat(data.field8);

            if (!isNaN(latitude) && !isNaN(longitude)) {
                let position = [latitude, longitude];
                marker.setLatLng(position);
                map.setView(position, 15);
                console.log("Updated Location: ", position);
            }
        })
        .catch(error => console.error("Error fetching GPS data:", error));
}

// Fetch data every 5 seconds
setInterval(fetchGPSData, 5000);
