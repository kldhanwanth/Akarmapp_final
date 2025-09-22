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

const colors = {
  background: '#000000',
  surface: '#1a1a1a',
  onSurface: '#ffffff',
  primary: '#ffffff',
  secondary: '#808080',
};

const AlarmScreen = () => {
  const [alarms, setAlarms] = useState([
    { id: '1', time: '08:00 AM', enabled: true },
    { id: '2', time: '09:30 AM', enabled: false },
    { id: '3', time: '12:00 PM', enabled: true },
  ]);
  const [showPicker, setShowPicker] = useState(false);
  const [newAlarmTime, setNewAlarmTime] = useState(new Date());

  const onTimeChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || newAlarmTime;
    setShowPicker(Platform.OS === 'ios');
    if (event.type === 'set') {
      const hours = currentDate.getHours().toString().padStart(2, '0');
      const minutes = currentDate.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes} ${
        currentDate.getHours() >= 12 ? 'PM' : 'AM'
      }`;

      const newAlarm = {
        id: Math.random().toString(),
        time: formattedTime,
        enabled: true,
      };
      setAlarms([...alarms, newAlarm]);
      Alert.alert('Alarm Set', `Alarm for ${formattedTime} has been set.`);
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

  const renderAlarmItem = ({ item }: { item: { id: string; time: string; enabled: boolean } }) => (
    <View style={styles.alarmItem}>
      <View>
        <Text style={styles.alarmTime}>{item.time}</Text>
        <Text style={styles.alarmLabel}>{item.enabled ? 'Alarm' : 'Alarm Off'}</Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
