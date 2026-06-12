let selectedMood = "";
let selectedTime = "";

function selectMood(mood) {
    document.getElementById("moodLazy").className = "mood-option";
    document.getElementById("moodProductive").className = "mood-option";
    document.getElementById("moodFun").className = "mood-option";
    // to highlight the picked one
    if (mood == "lazy") {
        document.getElementById("moodLazy").className = "mood-option mood-active-lazy";
    } else if (mood == "productive") {
        document.getElementById("moodProductive").className = "mood-option mood-active-productive";
    } else {
        document.getElementById("moodFun").className = "mood-option mood-active-fun";
    }
    selectedMood = mood;
}
// to reset all time options
function selectTime(time) {
    document.getElementById("time10").className = "time-option";
    document.getElementById("time30").className = "time-option";
    document.getElementById("time60").className = "time-option";
    document.getElementById("time" + time).className = "time-option time-active";
    selectedTime = time;
}
// for picking random mood and time
function surpriseMe() {
    let moods = ["lazy", "productive", "fun"];
    let times = ["10", "30", "60"];
    let mood = moods[Math.floor(Math.random() * 3)];
    let time = times[Math.floor(Math.random() * 3)];
    selectMood(mood);
    selectTime(time);
    let city = document.getElementById("cityInput").value;
    if (city) {
        getPlan();
    } else {
        alert("Enter your city first!");
    }
}
async function getPlan() {
    let city = document.getElementById("cityInput").value.trim();
    if (!city) {
        alert("Please enter your city name!");
        return;
    }
    if (!selectedMood) {
        alert("Please select your mood!");
        return;
    }
    if (!selectedTime) {
        alert("Please select your time!");
        return;
    }
    let resultBox = document.getElementById("resultBox");
    resultBox.innerHTML = `
        <div class="result-card">
            <div class="loading">⏳ Reading your vibe and the weather...</div>
        </div>
    `;
    try {
        let res = await fetch("/api/getplan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                city: city,
                mood: selectedMood,
                time: selectedTime
            })
        });
        let data = await res.json();
        if (!res.ok) {
            resultBox.innerHTML = `
                <div class="result-card">
                    <div class="loading">❌ ${data.error}</div>
                </div>
            `;
            return;
        }
        //result box that appears
        resultBox.innerHTML = `
            <div class="result-card">
                <div class="greeting">${data.greeting}</div>
                <div class="task-box">
                    <div class="task-label">YOUR TASK ⚡</div>
                    <div class="task-text">${data.task}</div>
                </div>
                <div class="tip-box">
                    <div class="tip-label">WEATHER TIP 🌤️</div>
                    <div class="tip-text">${data.tip}</div>
                </div>
                <div class="weather-row">
                    <span class="weather-pill">📍 ${city}</span>
                    <span class="weather-pill">🌡️ ${data.temp}°C</span>
                    <span class="weather-pill">💧 ${data.humidity}%</span>
                    <span class="weather-pill">🕐 ${data.timeOfDay}</span>
                </div>
            </div>
        `;
    } catch (err) {
        resultBox.innerHTML = `
            <div class="result-card">
                <div class="loading">${err.message}</div>
            </div>
        `;
    }
}