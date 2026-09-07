export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }
    try {
        let { city, mood, time } = req.body;
        let WEATHER_KEY = process.env.WEATHER_KEY;
        let GROQ_KEY = process.env.GROQ_KEY;
        // to get the weather
        let weatherRes = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_KEY}&units=metric`
        );
        let weather = await weatherRes.json();
        if (weather.cod !== 200) {
            return res.status(404).json({ error: "City not found" });
        }
        let desc = weather.weather[0].description;
        let temp = Math.round(weather.main.temp);
        let humidity = weather.main.humidity;

        let hour = new Date().getHours();
        let timeOfDay = "afternoon";
        if (hour >= 5 && hour <= 11) {
            timeOfDay = "morning";
        } else if (hour >= 17 && hour <= 20) {
            timeOfDay = "evening";
        } else if (hour >= 21 || hour <= 4) {
            timeOfDay = "night";
        }

        let moodText = {
            lazy: "lazy and low energy",
            productive: "productive and focused",
            fun: "fun and social"
        };
        let prompt = `
                    You are TinyShift, a friendly smart life assistant.

                    Here is the user's current situation:
                    - City: ${city}
                    - Weather: ${desc}
                    - Temperature: ${temp}°C
                    - Humidity: ${humidity}%
                    - Time of day: ${timeOfDay}
                    - Mood: ${moodText[mood]}
                    - Time available: ${time} minutes

                    Give them:
                    1. A warm friendly one-line greeting based on weather and time
                    2. One specific activity or micro-task they should do right now that fits their mood and available time
                    3. One short weather tip

                    Keep the tone casual, warm and human.

                    Format exactly like this:
                    GREETING: (your greeting here)
                    TASK: (your task suggestion here)
                    TIP: (your weather tip here)
                    `;

        let aiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_KEY}`
            },
            body: JSON.stringify({
                model: "groq/compound-mini",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 300
            })
        });
        let aiData = await aiRes.json();
        if (aiData.error) {
            return res.status(500).json({ error: aiData.error.message });
        }
        let reply = aiData.choices[0].message.content;
        let greeting = reply.match(/GREETING:(.*)/)?.[1]?.trim() || "Hey there!";
        let task = reply.match(/TASK:(.*)/)?.[1]?.trim() || "Take a short break.";
        let tip = reply.match(/TIP:(.*)/)?.[1]?.trim() || "Stay hydrated.";
        return res.status(200).json({
            greeting,
            task,
            tip,
            temp,
            humidity,
            timeOfDay
        });
    } catch (err) {
        console.error("error in getplan:", err);
        return res.status(500).json({ error: "Something went wrong. Please try again." });
    }
}
