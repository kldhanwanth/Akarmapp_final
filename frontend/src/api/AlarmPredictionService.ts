import { Alert } from 'react-native';

// NOTE: You MUST replace this with your actual Ngrok URL when testing on a real device or Expo Go!
// Example: const API_URL = 'https://xxxxxx.ngrok-free.app';
const API_URL = 'https://unpositivistic-unlingering-mable.ngrok-free.dev'; // Placeholder - will be used by Android emulator by default

// Type definition for the data sent to the Flask API
interface PredictionInput {
    user_id: number;
    bedtime: string;
    sleep_duration_hours: number;
    screen_time_before_bed_min: number;
    light_activity_min: number;
    is_weekend: number; // 0 for weekday, 1 for weekend
    chronotype: string; // 'early', 'late', 'standard'
    alarm_time: string;
}

// Type definition for the prediction response
interface AlarmPlan {
    prediction_score: number;
    strategy: string;
    wake_up_mode: string;
    music_type: string;
    snooze_allowance: string;
    message: string;
}

/**
 * Calls the Flask API to get personalized alarm suggestions.
 */
export async function fetchAlarmPrediction(data: PredictionInput): Promise<AlarmPlan | null> {
    
    // Replace the API_URL with the Ngrok URL you copied!
    const predictionUrl = `${API_URL}/predict_alarm`;

    try {
        const response = await fetch(predictionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            Alert.alert("API Error", `Prediction failed: ${errorData.message}`);
            return null;
        }

        const result = await response.json();
        
        // Return the alarm plan object
        return result.prediction as AlarmPlan;

    } catch (error) {
        console.error("Network or Fetch Error:", error);
        Alert.alert(
            "Connection Failed",
            "Could not connect to the prediction API. Ensure your Flask server is running and Ngrok is active."
        );
        return null;
    }
}
