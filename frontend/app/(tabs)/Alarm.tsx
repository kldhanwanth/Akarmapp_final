import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

// CORRECTED PATH: Going up two levels (out of (tabs) and out of app) 
// to reach the 'src' folder which is alongside the 'app' folder.
import { fetchAlarmPrediction } from '../../src/api/AlarmPredictionService'; 

// NOTE: You MUST ensure the path above is correct for your specific file structure.
// If your 'src' folder is right next to 'app', this path should work.

const colors = {
  background: '#000000',
  surface: '#1a1a1a',
  onSurface: '#ffffff',
  primary: '#ffffff',
  secondary: '#808080',
};

// --- MOCK USER INPUT (To be replaced by user input fields later) ---
const MOCK_USER_INPUT = {
    user_id: 1, // Static user ID for mock history lookup on Flask side
    sleep_duration_hours: 7.5,
    screen_time_before_bed_min: 65,
    light_activity_min: 90,
    is_weekend: 0, // Assuming weekday now
    chronotype: 'standard',
    // FIX: Added 'bedtime' to satisfy the TypeScript interface in AlarmPredictionService.ts
    bedtime: '23:30', 
};
// --------------------------------------------------------------------


const AlarmScreen = () => {
  const [alarms, setAlarms] = useState([
    { id: '1', time: '08:00 AM', enabled: true, prediction: null as any },
  ]);
  const [showPicker, setShowPicker] = useState(false);
  const [newAlarmTime, setNewAlarmTime] = useState(new Date());

  const onTimeChange = async (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || newAlarmTime;
    setShowPicker(Platform.OS === 'ios');

    if (event.type === 'set') {
      // Format time for display (e.g., 08:00 AM)
      const formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      // Format time for API (e.g., 08:00 or 20:00)
      const alarmTimeStr = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      
      // 1. Prepare Prediction Input Data
      const predictionInput = {
          ...MOCK_USER_INPUT,
          alarm_time: alarmTimeStr, // HH:MM format for Python processing
      };

      // 2. Call Prediction API
      const prediction = await fetchAlarmPrediction(predictionInput);

      // 3. Update UI and Alarm List
      if (prediction) {
          const newAlarm = {
              id: Math.random().toString(),
              time: formattedTime,
              enabled: true,
              prediction: prediction,
          };
          setAlarms([...alarms, newAlarm]);
          
          Alert.alert(
              `AI Recommendation (${prediction.prediction_score})`, 
              `Mode: ${prediction.wake_up_mode}\nMusic: ${prediction.music_type}\nSnooze: ${prediction.snooze_allowance}`
          );
      } else {
          // Fallback if API call fails (for local development/debugging)
          Alert.alert('Alarm Set Locally', `Alarm set for ${formattedTime} (API call failed).`);
      }
    }
    setNewAlarmTime(currentDate);
  };

  const toggleAlarm = (id: string) => {
    setAlarms(
      alarms.map((alarm) =>
        alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
      )
    );
  };

  const renderAlarmItem = ({ item }: { item: typeof alarms[0] }) => (
    <View style={styles.alarmItem}>
      <View>
        <Text style={styles.alarmTime}>{item.time}</Text>
        <Text style={styles.alarmLabel}>
          {item.enabled ? (item.prediction?.strategy || 'Alarm') : 'Alarm Off'}
        </Text>
        {item.prediction && (
            <Text style={styles.predictionText}>
                Score: {item.prediction.prediction_score} | Mode: {item.prediction.wake_up_mode}
            </Text>
        )}
      </View>
      <Switch
        value={item.enabled}
        onValueChange={() => toggleAlarm(item.id)}
        trackColor={{ false: colors.secondary, true: colors.primary }}
        thumbColor={colors.onSurface}
      />
    </View>
  );

  return (
    <View style={styles.screenContainer}>
      <FlatList
        data={alarms}
        keyExtractor={(item) => item.id}
        renderItem={renderAlarmItem}
        contentContainerStyle={styles.alarmList}
      />
      <TouchableOpacity style={styles.fab} onPress={() => setShowPicker(true)}>
        <Ionicons name="add" size={24} color="#000" />
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={newAlarmTime}
          mode="time"
          is24Hour={false}
          display="spinner"
          onChange={onTimeChange}
        />
      )}
    </View>
  );
};

export default AlarmScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  alarmItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 16,
    marginBottom: 10,
  },
  alarmTime: {
    fontSize: 48,
    fontWeight: '300',
    color: colors.onSurface,
    fontFamily: 'Quicksand-Regular',
  },
  alarmLabel: {
    fontSize: 14,
    color: '#A0A0A0',
    fontFamily: 'Quicksand-Regular',
  },
  predictionText: {
    fontSize: 12,
    color: '#D0D0D0',
    fontFamily: 'Quicksand-Regular',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alarmList: {
    paddingBottom: 80,
  },
});
