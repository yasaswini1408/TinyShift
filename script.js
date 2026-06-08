let selectedMood = "";
let selectedTime = "";

function selectMood(mood) {
document.getElementById("moodLazy").className = "mood-option";
document.getElementById("moodProductive").className = "mood-option";
document.getElementById("moodFun").className = "mood-option";

const moodMap = {
    lazy: "moodLazy",
    productive: "moodProductive",
    fun: "moodFun"
};

document.getElementById(
    moodMap[mood]
).className = `mood-option mood-active-${mood}`;

selectedMood = mood;


}

function selectTime(time) {
document.getElementById("time10").className = "time-option";
document.getElementById("time30").className = "time-option";
document.getElementById("time60").className = "time-option";


document.getElementById(`time${time}`).className =
    "time-option time-active";

selectedTime = time;


}

function surpriseMe() {
const moods = ["lazy", "productive", "fun"];
const times = ["10", "30", "60"];


const randomMood =
    moods[Math.floor(Math.random() * moods.length)];

const randomTime =
    times[Math.floor(Math.random() * times.length)];

selectMood(randomMood);
selectTime(randomTime);

const city = document.getElementById("cityInput").value;

if (city) {
    getPlan();
} else {
    alert("Enter your city first!");
}

}

async function getPlan() {
const city =
document.getElementById("cityInput").value.trim();

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

const resultBox =
    document.getElementById("resultBox");

resultBox.innerHTML = `
    <div class="result-card">
        <div class="loading">
            ⏳ Reading your vibe and the weather...
        </div>
    </div>
`;

try {
    const res = await fetch("/api/getplan.js", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            city,
            mood: selectedMood,
            time: selectedTime
        })
    });

    const data = await res.json();

    if (!res.ok) {
        resultBox.innerHTML = `
            <div class="result-card">
                <div class="loading">
                    ❌ ${data.error}
                </div>
            </div>
        `;
        return;
    }

    resultBox.innerHTML = `
        <div class="result-card">

            <div class="greeting">
                ${data.greeting}
            </div>

            <div class="task-box">
                <div class="task-label">
                    YOUR TASK ⚡
                </div>

                <div class="task-text">
                    ${data.task}
                </div>
            </div>

            <div class="tip-box">
                <div class="tip-label">
                    WEATHER TIP 🌤️
                </div>

                <div class="tip-text">
                    ${data.tip}
                </div>
            </div>

            <div class="weather-row">
                <span class="weather-pill">
                    📍 ${city}
                </span>

                <span class="weather-pill">
                    🌡️ ${data.temp}°C
                </span>

                <span class="weather-pill">
                    💧 ${data.humidity}%
                </span>

                <span class="weather-pill">
                    🕐 ${data.timeOfDay}
                </span>
            </div>

        </div>
    `;
} catch (error) {
    resultBox.innerHTML = `
        <div class="result-card">
            <div class="loading">
                ${error.message}
            </div>
        </div>
    `;
}


}
