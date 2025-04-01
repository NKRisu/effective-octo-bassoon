# Train Location App

This application displays real-time train locations on a map using data from the Digitraffic API. Users can click on a train marker to view additional information about the train, such as its speed, timestamp, and composition details. The map updates automatically every 5 seconds to keep the information fresh without overwhelming the API with requests.

---

## Features

- Displays real-time train locations on a map.
- Allows users to click on train markers to view detailed information about the train.
- Automatically updates train locations every 5 seconds.
- Uses public data from the Digitraffic API.
- Provides a clean and user-friendly interface.

---

## Technologies Used

### Languages and Frameworks
- **JavaScript**: Core language for the application logic.
- **HTML**: Structure of the web page.
- **CSS**: Styling for the map and UI.

### Libraries
- **Leaflet.js**: For rendering the interactive map and markers.
- **Deno**: A modern runtime for JavaScript and TypeScript, used to serve the application.

### APIs
- **Digitraffic API**: Provides real-time train location and composition data.

---

## How to Use the Application

1. **Run the Application**:
   - Ensure you have [Deno](https://deno.land/) installed on your system.
   - Start the server by running the following command in the terminal:
     ```bash
     deno run --allow-net --allow-env --allow-read --watch app.js
     ```
   - Open your browser and navigate to `http://localhost:8000`.

2. **View Train Locations**:
   - The map will display train markers representing real-time train locations.

3. **Get Train Details**:
   - Click on a train marker to view additional details, such as:
     - Train number
     - Speed
     - Timestamp
     - Train composition (locomotives, wagons, etc.)

4. **Automatic Updates**:
   - The map updates every 5 seconds to reflect the latest train locations.

---

## How to Update the Application

1. **Update Dependencies**:
   - Ensure you are using the latest version of Deno and Leaflet.js.

2. **Modify the Code**:
   - Update the [apiCalls.js](http://_vscodecontentref_/1) file to adjust API endpoints or add new features.
   - Modify [mapGraph.js](http://_vscodecontentref_/2) to enhance the map functionality or UI.

3. **Test the Application**:
   - Run the application locally and verify that all features work as expected.

4. **Deploy Changes**:
   - Push the updated code to your GitHub repository.
   - Deploy the application to your preferred hosting platform.

---

## Folder Structure
TrainLocationsApp/
├── app.js          # Deno server for serving the application

├── README.md       # Documentation for the application

├── views/

│   └── index.html  # Main HTML file for the application

├── static/

│   ├── images/     # Contains icons for map markers

│   ├── apiCalls.js # Handles API calls to Digitraffic

│   └── mapGraph.js # Handles map rendering and marker updates



---

## APIs Used

### Digitraffic API
- **Train Locations**: Provides real-time train location data in GeoJSON format.
  - Endpoint: `https://rata.digitraffic.fi/api/v1/train-locations.geojson/latest`
- **Train Compositions**: Provides detailed information about train composition.
  - Endpoint: `https://rata.digitraffic.fi/api/v1/compositions/{departure_date}/{train_number}`
- **Stations Metadata**: Provides metadata about train stations.
  - Endpoint: `https://rata.digitraffic.fi/api/v1/metadata/stations`

---

## Known Issues and Future Improvements

### Known Issues
- **Flashing Markers**: When updating train locations, markers are removed and re-added, causing a flashing effect.
- **Error Handling**: Limited error handling for API failures.

### Future Improvements
- **Smooth Transitions**: Implement marker position updates instead of removing and re-adding markers.
- **Enhanced UI**: Add more styling and features to improve user experience.
- **Caching**: Cache station metadata to reduce redundant API calls.
- **Removing all the logging**: Removing excess logging to clean up the console and the code

---

## Author

Application created by **NKRisu** on GitHub.  
Using public data from the **Digitraffic API**.
                        
                    
