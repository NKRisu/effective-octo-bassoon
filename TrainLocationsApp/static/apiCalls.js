// API call URLs

const train_locations_url = "https://rata.digitraffic.fi/api/v1/train-locations.geojson/latest";
const update_times_url = "https://rata.digitraffic.fi/api/v1/update-times";
const compositions_trains_url = "https://rata.digitraffic.fi/api/v1/compositions/{departure_date}/{train_number}";
const stations_url = "https://rata.digitraffic.fi/api/v1/metadata/stations";

const headers = {
    "Digitraffic-User": "Junahenkilö/FoobarApp 1.0",    // Replace with actual user
    "Accept-Encoding": "gzip",
};

async function getAllRunningTrains() {
    console.log("Fetching running trains...");
    try {
        const response = await fetch(train_locations_url, {
            method: 'GET', // Changed to GET since this API doesn't require POST
            headers: headers,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Train locations API Response:", result);

        // Parse the GeoJSON response
        const trains = result.features.map(feature => {
            const coordinates = feature.geometry.coordinates; // [longitude, latitude]
            const properties = feature.properties;

            return {
                trainNumber: properties.trainNumber,
                departureDate: properties.departureDate,
                timestamp: properties.timestamp,
                speed: properties.speed,
                accuracy: properties.accuracy,
                location: [coordinates[1], coordinates[0]], // Convert to [latitude, longitude]
            };
        });

        console.log("Parsed Train Data:", trains);
        return trains;
    } catch (error) {
        console.error("Error fetching running trains:", error);
        return []; // Return an empty array to avoid breaking the app
    }
}

async function getUpdateTimes() {
    console.log("Fetching update times...");
    try {
        const response = await fetch(update_times_url, {
            method: 'GET',
            headers: headers,
            mode: 'no-cors',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error fetching update times:', error);
        throw error;
    }
}

async function getCompositionOfTrain(trainNumber, departureDate, stationMapping) {
    console.log("Fetching train composition...");
    const url = compositions_trains_url
        .replace("{departure_date}", departureDate)
        .replace("{train_number}", trainNumber);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: headers,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Train composition API Response:", result);

        // Parse the response
        const trainComposition = result; // object
        if (!trainComposition || !trainComposition.journeySections || trainComposition.journeySections.length === 0) {
            console.warn("No composition data available for the train.");
            return null;
        }

        const journey = trainComposition.journeySections[0]; // Assuming one journey section
        const locomotives = journey.locomotives || [];
        const wagons = journey.wagons || [];

        // Extract journey details
        const journeyDetails = {
            startStation: stationMapping[journey.beginTimeTableRow.stationShortCode] || journey.beginTimeTableRow.stationShortCode,
            startTime: journey.beginTimeTableRow.scheduledTime,
            endStation: stationMapping[journey.endTimeTableRow.stationShortCode] || journey.endTimeTableRow.stationShortCode,
            endTime: journey.endTimeTableRow.scheduledTime,
        };

        // Extract locomotive details
        const locomotiveDetails = locomotives.map(loco => ({
            location: loco.location,
            type: loco.locomotiveType,
            powerType: loco.powerType,
        }));

        // Extract wagon details
        const wagonDetails = wagons.map(wagon => ({
            location: wagon.location,
            type: wagon.wagonType,
            salesNumber: wagon.salesNumber,
            length: wagon.length,
            petFriendly: wagon.pet || false,
            catering: wagon.catering || false,
            disabledAccess: wagon.disabled || false,
        }));

        // Combine all details
        const compositionDetails = {
            trainNumber: trainComposition.trainNumber,
            departureDate: trainComposition.departureDate,
            journey: journeyDetails,
            locomotives: locomotiveDetails,
            wagons: wagonDetails,
            totalLength: journey.totalLength,
            maximumSpeed: journey.maximumSpeed,
        };

        console.log("Parsed Train Composition:", compositionDetails);
        return compositionDetails;
    } catch (error) {
        console.error("Error fetching train composition:", error);
        throw error;
    }
}

// Function to fetch station mapping (short code to long code)
async function getStationMapping() {
    console.log("Fetching station mapping...");
    try {
        const response = await fetch(stations_url, {
            method: 'GET',
            headers: headers,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Stations API Response:", result);

        // Create a mapping of stationShortCode to stationName
        const stationMapping = result.reduce((map, station) => {
            map[station.stationShortCode] = station.stationName;
            return map;
        }, {});

        console.log("Station Mapping:", stationMapping);
        return stationMapping;
    } catch (error) {
        console.error("Error fetching station mapping:", error);
        throw error;
    }
}

// Function to fetch raw station data
async function getStations() {
    console.log("Fetching stations...");
    try {
        const response = await fetch(stations_url, {
            method: 'GET',
            headers: headers,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Stations API Response:", result);

        // Ensure the result is an array
        if (!Array.isArray(result)) {
            throw new Error("Unexpected response format: Stations data is not an array");
        }

        return result; // Return the raw array of stations
    } catch (error) {
        console.error("Error fetching stations:", error);
        throw error;
    }
}

console.log("Calling getAllRunningTrains...");
getAllRunningTrains()

console.log("Calling getStations...");
getStations()

console.log("Calling getUpdateTimes...");
getUpdateTimes()

console.log("Calling getCompositionOfTrain...");
getCompositionOfTrain()

console.log("Calling getStationMapping...");
getStationMapping();

console.log("API calls completed.");

export { getAllRunningTrains, getStations, getUpdateTimes, getCompositionOfTrain, getStationMapping };