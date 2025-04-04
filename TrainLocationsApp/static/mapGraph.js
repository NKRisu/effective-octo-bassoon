import { getAllRunningTrains, getStations, getCompositionOfTrain, updateTrainLocation, getStationMapping } from './apiCalls.js';

// Initialize the map
const map = L.map('map').setView([64, 26], 6); // Default center and zoom level
console.log("Map initialized:", map);

// Add a tile layer (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

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

// Track if marker is open, send it to apiCalls.js to pause the update timer
export let isTrainMarkerClicked = false;

// Map to store train markers by train number
const trainMarkers = new Map();

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
                    // Only show details received from train location-API
                    .bindPopup(`
                        <b>Train Number:</b> ${train.trainNumber}<br>
                        <b>Speed:</b> ${train.speed} km/h<br>
                        <b>Timestamp:</b> ${train.timestamp}
                    `);

                // Add click event listener to the marker
                marker.on("click", () => {
                    console.log(`Train marker clicked: ${train.trainNumber}, ${train.departureDate}`);

                    isTrainMarkerClicked = true;
                    
                    // Call getCompositionOfTrain with trainNumber, departureDate, and stationMapping
                    getCompositionOfTrain(train.trainNumber, train.departureDate, stationMapping)
                        .then(composition => {
                            if (composition) {
                                console.log("Train Composition Details:", composition);
                            
                                const locomotives = composition.locomotives.map(loco => `
                                    <li>Type: ${loco.type}, Power: ${loco.powerType}</li>
                                `).join("");
                            
                                // Calculate the number of wagons
                                const wagonCount = composition.wagons.length;
                            
                                // Generate a list of wagon types and their features
                                const wagonDetails = composition.wagons.map(wagon => `
                                    <li>Type: ${wagon.type}${wagon.petFriendly ? ", Pet-Friendly" : ""}${wagon.disabledAccess ? ", Disabled Access" : ""}${wagon.catering ? ", Catering" : ""}</li>
                                `).join("");
                            
                                // Use trainType and trainCategory from the composition object
                                const trainType = composition.trainType || "N/A";
                                const trainCategory = composition.trainCategory || "N/A";
                            
                                // Display the composition details in a popup
                                marker.bindPopup(`
                                    <b>Train Number:</b> ${composition.trainNumber}<br>
                                    <b>Train Type:</b> ${trainType}<br>
                                    <b>Train Category:</b> ${trainCategory}<br>
                                    <b>Start Station:</b> ${composition.journey.startStation}<br>
                                    <b>End Station:</b> ${composition.journey.endStation}<br>
                                    <b>Maximum Speed:</b> ${composition.maximumSpeed} km/h<br>
                                    <b>Speed:</b> ${train.speed} km/h<br>
                                    <b>Total Length:</b> ${composition.totalLength} m<br>
                                    <b>Locomotives:</b>
                                    <ul>${locomotives}</ul>
                                    <b>Wagons:</b> ${wagonCount}<br>
                                    <ul>${wagonDetails}</ul>
                                `).openPopup();
                            } else {
                                console.warn("No composition data available.");
                            }
                        })
                        .catch(error => {
                            console.error("Error fetching train composition:", error);
                        });
                });

                // Reset the state when the popup is closed
                marker.on("popupclose", () => {
                    console.log("Popup closed for train marker:", train.trainNumber);
                    isTrainMarkerClicked = false; // Reset the state
                });

                console.log("Marker added for train:", train.trainNumber);
            }
        });
    } catch (error) {
        console.error("Error adding train markers:", error);
    }
}



// Function to periodically update train markers
async function periodicallyUpdateTrainMarkers() {
    try {
        console.log("Fetching station mapping...");
        const stationMapping = await getStationMapping();
        console.log("Station mapping received:", stationMapping);

        // Call updateTrainLocation every 5 seconds
        setInterval(async () => {
            if (isTrainMarkerClicked) {
                console.log("Train marker is clicked. Skipping update...");
                return; // Skip updates if a train marker is clicked
            }

            console.log("Updating train markers...");
            const trains = await updateTrainLocation(); // Fetch updated train locations
            console.log("Updated train data received:", trains);

            // Clear existing markers and add new ones
            map.eachLayer(layer => {
                if (layer instanceof L.Marker && layer.options.icon === trainMarkerIcon) {
                    map.removeLayer(layer);
                }
            });

            addTrainMarkers(trains, stationMapping);
        }, 5000);
    } catch (error) {
        console.error("Error in periodically updating train markers:", error);
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

console.log("Calling periodicallyUpdateTrainMarkers...");
periodicallyUpdateTrainMarkers();

// Export the function for use in app.js
export { addTrainMarkers, addStationMarkers };