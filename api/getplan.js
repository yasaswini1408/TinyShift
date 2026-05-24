export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }
    const { city, mood, time } = req.body;
    const WEATHER_KEY = process.env.WEATHER_KEY;
    const GROQ_KEY = process.env.GROQ_KEY;
    const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_KEY}&units=metric`
    );
    const weatherData = await weatherRes.json();
    if (weatherData.cod !== 200) {
        return res.status(404).json({ error: "City not found" });
    }
    const description = weatherData.weather[0].description;
    const temp = Math.round(weatherData.main.temp);
    const humidity = weatherData.main.humidity;
    const hour = new Date().getHours();
    let timeOfDay = "afternoon";
    if (hour >= 5 && hour <= 11) timeOfDay = "morning";
    if (hour >= 17 && hour <= 20) timeOfDay = "evening";
    if (hour >= 21 || hour <= 4) timeOfDay = "night";
    const moodLabel = {
        lazy: "lazy and low energy",
        productive: "productive and focused",
        fun: "fun and social"
    };
    const prompt = `
    You are TinyShift, a friendly smart life assistant.

    Here is the user's current situation:
    - City: ${city}
    - Weather: ${description}
    - Temperature: ${temp}°C
    - Humidity: ${humidity}%
    - Time of day: ${timeOfDay}
    - Mood: ${moodLabel[mood]}
    - Time available: ${time} minutes

    Give them:
    1. A warm friendly one-line greeting based on weather and time
    2. One specific activity or micro-task they should do right now that fits their mood and time available
    3. One short weather tip for their day

    Keep the tone casual, warm and human. Not robotic.
    Format your response exactly like this:

    GREETING: (your greeting here)
    TASK: (your task suggestion here)
    TIP: (your weather tip here)
  `;
    const groqRes = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 300
            })
        }
    );
    const groqData = await groqRes.json();
    if (groqData.error) {
        return res.status(500).json({ error: groqData.error.message });
    }
    const reply = groqData.choices[0].message.content;
    const greeting = reply.match(/GREETING:(.*)/)?.[1]?.trim() || "Hey there!";
    const task = reply.match(/TASK:(.*)/)?.[1]?.trim() || "Take a short break!";
    const tip = reply.match(/TIP:(.*)/)?.[1]?.trim() || "Stay hydrated!";
    return res.status(200).json({
        greeting,
        task,
        tip,
        temp,
        humidity,
        timeOfDay
    });
}