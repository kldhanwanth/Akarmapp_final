import { Alert } from 'react-native';

// NOTE: Set your Gemini API Key here if running locally outside of the Canvas environment
const API_KEY = "AIzaSyAlyvMgy0_qQmqwwQ3Cm8APBGNHf7UcoaE"; 
const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;

// --- TYPE DEFINITIONS ---

interface PredictionInput {
    user_id: number;
    bedtime: string;
    sleep_duration_hours: number;
    screen_time_before_bed_min: number;
    light_activity_min: number;
    is_weekend: number; // 0 or 1
    chronotype: string;
    alarm_time: string; // HH:MM
    // New fields for the AI to choose the mode based on user's selected preference
    user_wake_up_mode: string; // e.g., 'Mood', 'Radio', 'Calendar'
}

export interface AlarmPlan {
    prediction_score: number;
    strategy: string;
    wake_up_mode: string;
    music_type: string;
    snooze_allowance: string;
    message: string;
    // New fields for specific alarm actions
    media_action: string; // SPOTIFY_MOOD, RADIO_PLAY, CALENDAR_READ
    snooze_pattern: string; // e.g., "5-4-3-LOUD"
}

// --- CORE PREDICTION FUNCTION ---

export async function fetchAlarmPrediction(data: PredictionInput): Promise<AlarmPlan | null> {
    
    const userPrompt = `
    Act as a highly specialized Smart Alarm AI Orchestrator. Your task is to analyze the user's current sleep/lifestyle data and chosen wake-up preference, then generate a comprehensive, personalized alarm plan.

    **Goal:** Predict next-day readiness and formulate a strategy to ensure the user wakes up efficiently, preventing oversleeping, especially for important events.

    **User Input Data:**
    - User ID: ${data.user_id}
    - Planned Bedtime: ${data.bedtime}
    - Target Alarm Time: ${data.alarm_time}
    - Estimated Sleep Duration: ${data.sleep_duration_hours} hours
    - Screen Time Before Bed: ${data.screen_time_before_bed_min} minutes
    - Daytime Activity: ${data.light_activity_min} minutes
    - Chronotype: ${data.chronotype}
    - Is Weekend: ${data.is_weekend === 1 ? 'Yes' : 'No'}
    - **User Preference (Crucial):** ${data.user_wake_up_mode}

    **Instructions for Output:**
    1. **Predict Smart Sleep Meter:** Give a readiness score (1.0 to 10.0, 1 decimal).
    2. **Define Media Action:** Based ONLY on the User Preference, set 'media_action' to one of the following: 
        - SPOTIFY_MOOD (If preference is 'Mood')
        - RADIO_PLAY (If preference is 'Radio')
        - CALENDAR_READ (If preference is 'Calendar')
    3. **Define Snooze Pattern:** Based on the predicted score, define a strict pattern. Use a time series format (e.g., "5-4-3-0" for 5 min snooze, 4 min snooze, 3 min snooze, then DISMISS/NO SNOOZE). If the score is very low (<4.0), the pattern must be "0-LOUD" (No snoozes, immediate energetic tone).
    4. **Generate Alarm Plan:** Fill out the remaining fields (strategy, wake_up_mode, music_type, snooze_allowance).
    5. **Output Format:** The result MUST be a single JSON object conforming exactly to the response schema. DO NOT include any text, markdown, or commentary outside of the JSON block.
    `;

    const systemInstruction = "You are a specialized JSON endpoint for generating personalized smart alarm plans based on human sleep data. Your only output must be a valid, single JSON object.";

    // 1. Construct the Payload with JSON Schema
    const payload = {
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: {
            parts: [{ text: systemInstruction }]
        },
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    prediction_score: { type: "NUMBER", description: "The predicted next-day readiness score (Smart Sleep Meter) between 1.0 and 10.0." },
                    strategy: { type: "STRING", description: "The overall recommendation (e.g., Optimal, Recovery, Standard)." },
                    wake_up_mode: { type: "STRING", description: "The recommended physical alarm behavior (e.g., Gentle-Rise, Energetic)." },
                    music_type: { type: "STRING", description: "The recommended style of music/sound/voice." },
                    snooze_allowance: { type: "STRING", description: "The recommended snooze policy (e.g., Strictly Avoid, 1 Max, Lenient)." },
                    message: { type: "STRING", description: "A brief, encouraging summary of the plan." },
                    media_action: { type: "STRING", description: "The required alarm action: SPOTIFY_MOOD, RADIO_PLAY, or CALENDAR_READ." },
                    snooze_pattern: { type: "STRING", description: "The sequence of snooze intervals in minutes (e.g., 5-4-3-0 or 0-LOUD)." }
                }
            }
        }
    };

    try {
        console.log("Sending request to Gemini API...");
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API Error:", response.status, errorText);
            Alert.alert("API Error", `Gemini returned status ${response.status}. Check console for details.`);
            return null;
        }

        const result = await response.json();
        
        // Extract and parse the JSON string from the response
        const jsonString = result?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (jsonString) {
            const parsedJson: AlarmPlan = JSON.parse(jsonString);
            return parsedJson;
        }
        
        Alert.alert("API Error", "Could not parse prediction result.");
        return null;

    } catch (error) {
        console.error("Network or Fetch Error:", error);
        Alert.alert(
            "Connection Failed",
            "Could not connect to the Gemini API. Check your network or API key."
        );
        return null;
    }
}
