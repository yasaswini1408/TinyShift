export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const { city, mood, time } = req.body;

        const WEATHER_KEY = process.env.WEATHER_KEY;
        const GROQ_KEY = process.env.GROQ_KEY;

        const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_KEY}&units=metric`
        );

        const weather = await weatherResponse.json();

        if (weather.cod !== 200) {
            return res.status(404).json({
                error: "City not found"
            });
        }

        const weatherDescription =
            weather.weather[0].description;

        const temperature =
            Math.round(weather.main.temp);

        const humidity =
            weather.main.humidity;

        const currentHour =
            new Date().getHours();

        let timeOfDay = "afternoon";

        if (currentHour >= 5 && currentHour <= 11) {
            timeOfDay = "morning";
        } else if (currentHour >= 17 && currentHour <= 20) {
            timeOfDay = "evening";
        } else if (currentHour >= 21 || currentHour <= 4) {
            timeOfDay = "night";
        }

        const moodDescriptions = {
            lazy: "lazy and low energy",
            productive: "productive and focused",
            fun: "fun and social"
        };

        const prompt = `
                        You are TinyShift, a friendly smart life assistant.

                        Here is the user's current situation:

                        - City: ${city}
                        - Weather: ${weatherDescription}
                        - Temperature: ${temperature}°C
                        - Humidity: ${humidity}%
                        - Time of day: ${timeOfDay}
                        - Mood: ${moodDescriptions[mood]}
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

        const aiResponse = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${GROQ_KEY}`
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    max_tokens: 300
                })
            }
        );

        const aiData = await aiResponse.json();

        if (aiData.error) {
            return res.status(500).json({
                error: aiData.error.message
            });
        }

        const aiReply =
            aiData.choices[0].message.content;

        const greeting =
            aiReply.match(/GREETING:(.*)/)?.[1]?.trim() ||
            "Hey there!";

        const task =
            aiReply.match(/TASK:(.*)/)?.[1]?.trim() ||
            "Take a short break.";

        const tip =
            aiReply.match(/TIP:(.*)/)?.[1]?.trim() ||
            "Stay hydrated.";

        return res.status(200).json({
            greeting,
            task,
            tip,
            temp: temperature,
            humidity,
            timeOfDay
        });

    } catch (error) {
        console.error("TinyShift API Error:", error);

        return res.status(500).json({
            error: "Something went wrong. Please try again."
        });
    }
}