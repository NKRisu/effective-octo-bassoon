import { getAllRunningTrains, getStations, getCompositionOfTrain, getUpdateTimes, getStationMapping } from './apiCalls.js';

// Initialize the map
const map = L.map('map').setView([61.12171, 28.49411], 7); // Default center and zoom level
console.log("Map initialized:", map);

// Add a tile layer (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Function to parse location string (e.g., "POINT (28.49411 61.12171)")
function parseLocation(locationString) {
    console.log("Parsing location string:", locationString);
    const match = locationString.match(/POINT \(([-\d.]+) ([-\d.]+)\)/);
    if (match) {
        return [parseFloat(match[2]), parseFloat(match[1])]; // [latitude, longitude]
    }
    console.error("Failed to parse location string:", locationString);
    return null;
}

// Station markers
const stationMarkerIcon = L.icon({
    iconUrl: './static/images/icons/blue-icon.png', // Corrected path for the blue icon
    iconSize: [32, 32], // Size for station markers
});

// Train markers
const trainMarkerIcon = L.icon({
    iconUrl: './static/images/icons/red-icon.png', // Corrected path for the red icon
    iconSize: [32, 32], // Size for train markers
});

// Function to add train markers to the map
async function addTrainMarkers() {
    try {
        console.log("Fetching station mapping...");
        const stationMapping = await getStationMapping();
        console.log("Station mapping received:", stationMapping);

        console.log("Fetching train data...");
        const trains = await getAllRunningTrains();
        console.log("Train data received:", trains);

        if (trains.length === 0) {
            console.warn("No train data available");
            return; // Exit if no train data is available
        }

        trains.forEach(train => {
            const location = train.location;
            console.log("Parsed location for train:", location);

            if (location) {
                const marker = L.marker(location, { icon: trainMarkerIcon })
                    .addTo(map)
                    .bindPopup(`
                        <b>Train Number:</b> ${train.trainNumber}<br>
                        <b>Speed:</b> ${train.speed} km/h<br>
                        <b>Timestamp:</b> ${train.timestamp}
                    `);

                // Add click event listener to the marker
                marker.on("click", () => {
                    console.log(`Train marker clicked: ${train.trainNumber}, ${train.departureDate}`);
                    
                    // Call getCompositionOfTrain with trainNumber, departureDate, and stationMapping
                    getCompositionOfTrain(train.trainNumber, train.departureDate, stationMapping)
                        .then(composition => {
                            if (composition) {
                                console.log("Train Composition Details:", composition);
                                // Display the composition details in a popup or sidebar
                                marker.bindPopup(`
                                    <b>Train Number:</b> ${composition.trainNumber}<br>
                                    <b>Start Station:</b> ${composition.journey.startStation}<br>
                                    <b>End Station:</b> ${composition.journey.endStation}<br>
                                    <b>Maximum Speed:</b> ${composition.maximumSpeed} km/h<br>
                                    <b>Total Length:</b> ${composition.totalLength} m
                                `).openPopup();
                            } else {
                                console.warn("No composition data available.");
                            }
                        })
                        .catch(error => {
                            console.error("Error fetching train composition:", error);
                        });
                });

                console.log("Marker added for train:", train.trainNumber);
            }
        });
    } catch (error) {
        console.error("Error adding train markers:", error);
    }
}

// Function to add station markers to the map
async function addStationMarkers() {
    try {
        console.log("Fetching stations...");
        const stations = await getStations(); // Call the API function from apiCalls.js
        console.log("Stations data received:", stations);

        stations.forEach(station => {
            if (station.latitude == null || station.longitude == null) {
                console.warn("Station has no latitude or longitude:", station);
                return; // Skip stations without latitude or longitude
            }

            const location = [station.latitude, station.longitude]; // Use latitude and longitude
            console.log("Parsed location for station:", location);

            if (location) {
                L.marker(location, { icon: stationMarkerIcon })
                    .addTo(map)
                    .bindPopup(`
                        <b>Station Name:</b> ${station.stationName}<br>
                        <b>Station Code:</b> ${station.stationShortCode}
                    `);
                console.log("Marker added for station:", station.stationName);
            }
        });
    } catch (error) {
        console.error("Error adding station markers:", error);
    }
}

console.log("Calling addTrainMarkers...");
addTrainMarkers();

console.log("Calling addStationMarkers...");
addStationMarkers()

// Export the function for use in app.js
export { addTrainMarkers, addStationMarkers };