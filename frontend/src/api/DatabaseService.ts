import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const FEEDBACK_KEY = 'akarm_user_feedback';
const SNOOZE_KEY = 'akarm_snooze_logs';
let isInitialized = false;

// --- UTILITY FUNCTIONS FOR ASYNC STORAGE ---

async function getLocalData(key: string): Promise<any[]> {
    try {
        const jsonValue = await AsyncStorage.getItem(key);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error(`Error reading data from ${key}:`, e);
        // The error log you shared: [ReferenceError: Property 'localStorage' doesn't exist] 
        // proves this error handling is essential.
        return [];
    }
}

async function saveLocalData(key: string, data: any[]): Promise<void> {
    try {
        const jsonValue = JSON.stringify(data);
        await AsyncStorage.setItem(key, jsonValue);
        console.log(`Data saved successfully to ${key} (AsyncStorage).`);
    } catch (e) {
        console.error(`Error writing data to ${key}:`, e);
    }
}

// --- PUBLIC DATABASE FUNCTIONS ---

export function initializeDatabase() {
    if (!isInitialized) {
        console.log("Database initialized: Using AsyncStorage for persistence.");
        isInitialized = true;
    }
}

export async function saveFeedbackRating(rating: number, alarmDetails: any) {
    const logs = await getLocalData(FEEDBACK_KEY);
    const newLog = {
        userId: 'local_user', // Mock user ID for local storage
        timestamp: new Date().toISOString(),
        rating: rating,
        ...alarmDetails,
    };
    logs.push(newLog);
    await saveLocalData(FEEDBACK_KEY, logs);
}

export async function logSnoozeEvent(durationMin: number, alarmId: string, predictionScore: number) {
    const logs = await getLocalData(SNOOZE_KEY);
    const newLog = {
        userId: 'local_user',
        timestamp: new Date().toISOString(),
        alarmId: alarmId,
        durationMin: durationMin,
        predictionScore: predictionScore,
    };
    logs.push(newLog);
    await saveLocalData(SNOOZE_KEY, logs);
    console.log(`Snooze event logged: ${durationMin} min (AsyncStorage).`);
}
