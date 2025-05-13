const firebaseConfig = {
    apiKey: "AIzaSyBRnTCvgBXKvhX6AUp1WwuXtWUR0bjmQik",
    databaseURL:  "https://project-nemo-cd4e5-default-rtdb.asia-southeast1.firebasedatabase.app/"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const sensors = {
    temp:   "/waterQuality/temperature",
    ph:     "/waterQuality/pH",
    turb:   "/waterQuality/turbidity",
    clear:  "/waterQuality/clearness",
    tds:    "/waterQuality/tds",
    feeder: "/fishFeeder/ultrasonicDistance"
};

function updateSensorData(id, value) {
    const el = document.getElementById(id);
    const st = document.getElementById("status-" + id);

    if (value == null) {
        el.textContent = "--";
        st.textContent = "Offline";
        st.classList.add("offline");
        st.classList.remove("online");
        return;
    }

    if (id === "temp" || id === "ph") value = parseFloat(value).toFixed(2);

    if (id === "tds") el.textContent = `${value} ppm`;
    else if (id === "temp") el.textContent = `${value} °C`;
    else el.textContent = value;

    st.textContent = "Online";
    st.classList.add("online");
    st.classList.remove("offline");
}

// Function to update the Feeder Bar and its status
function updateFeederBar(cm) {
    const bar = document.getElementById("feeder-bar");
    const status = document.getElementById("status-feeder");
    const feederStatus = document.getElementById("feeder-status");

    if (cm == null) {
        bar.style.width = "0%";  // No bar if data is missing
        status.textContent = "Offline";
        status.className = "status offline";
        feederStatus.textContent = "Offline";
        return;
    }

    // Check if the ultrasonic distance is less than 2 cm
    if (cm < 2) {
        bar.style.width = "100%";  // Full bar
        bar.style.backgroundColor = "green";  // Green color
        status.textContent = "Sufficient ✅";  // Set status to "Sufficient"
        status.className = "status online";  // Update status class
        feederStatus.textContent = "Sufficient ✅";  // Update feeder status
        return;
    }

    // Update for different unit handling:
    // --------------------------------------
    const full = 13;  // Max value, change if you want to adjust the max level for the units.
    const percentage = Math.max(0, Math.min(100, ((full - cm) / full) * 100));
    bar.style.width = `${percentage}%`;  // The width of the bar will be a percentage of the max value.

    let color = "green", text = "Sufficient ✅";

    if (cm > 10) {
        color = "red"; text = "Low ⚠️ Refill!";  // Change the text if your unit is different.
    } else if (cm > 5) {
        color = "orange"; text = "Moderate ⚠️";  // Change the text if your unit is different.
    }

    bar.style.backgroundColor = color;  // Bar color change based on the status.
    status.textContent = text;  // Update the status message with the new condition.
    status.className = "status online";  // Update the status class for color indication.
    feederStatus.textContent = text;  // Update the Feeder status text.
}

for (let [id, path] of Object.entries(sensors)) {
    if (id === "feeder") {
        db.ref(path).on("value", snap => updateFeederBar(snap.val()));  // Feeder data listener.
    } else {
        db.ref(path).on("value", snap => updateSensorData(id, snap.val()));  // Other sensor data listeners.
    }
}

document.getElementById("themeToggle").addEventListener("change", e => {
    document.body.classList.toggle("dark-mode", e.target.checked);
});
