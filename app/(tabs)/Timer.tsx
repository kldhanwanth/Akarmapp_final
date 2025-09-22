import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const colors = {
  background: '#000000',
  surface: '#1a1a1a',
  onSurface: '#ffffff',
  primary: '#ffffff',
  secondary: '#808080',
};

const TimerScreen = () => {
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('0');
  const [seconds, setSeconds] = useState('0');
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    const totalSeconds =
      parseInt(hours || '0') * 3600 +
      parseInt(minutes || '0') * 60 +
      parseInt(seconds || '0');
    if (totalSeconds > 0) {
      setTimeLeft(totalSeconds);
      setIsRunning(true);
    }
  };

  const stopTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(0);
    setHours('0');
    setMinutes('0');
    setSeconds('0');
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            setIsRunning(false);
            Alert.alert('Timer Finished', 'Your timer has run out!');
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (!isRunning && timeLeft !== 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const displayHours = Math.floor(timeLeft / 3600);
  const displayMinutes = Math.floor((timeLeft % 3600) / 60);
  const displaySeconds = timeLeft % 60;

  return (
    <View style={styles.screenContainer}>
      <View style={styles.timerDisplayContainer}>
        <Text style={styles.timerDisplay}>
          {displayHours.toString().padStart(2, '0')}:
          {displayMinutes.toString().padStart(2, '0')}:
          {displaySeconds.toString().padStart(2, '0')}
        </Text>
      </View>
      <View style={styles.timerInputContainer}>
        <TextInput
          style={styles.timerInput}
          keyboardType="numeric"
          placeholder="H"
          value={hours}
          onChangeText={setHours}
        />
        <Text style={styles.timerInputSeparator}>:</Text>
        <TextInput
          style={styles.timerInput}
          keyboardType="numeric"
          placeholder="M"
          value={minutes}
          onChangeText={setMinutes}
        />
        <Text style={styles.timerInputSeparator}>:</Text>
        <TextInput
          style={styles.timerInput}
          keyboardType="numeric"
          placeholder="S"
          value={seconds}
          onChangeText={setSeconds}
        />
      </View>
      <View style={styles.timerButtonContainer}>
        {!isRunning && (
          <TouchableOpacity style={styles.timerButton} onPress={startTimer}>
            <Ionicons name="play" size={24} color="#fff" />
          </TouchableOpacity>
        )}
        {isRunning && (
          <TouchableOpacity style={styles.timerButton} onPress={stopTimer}>
            <Ionicons name="pause" size={24} color="#fff" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.timerButton} onPress={resetTimer}>
          <Ionicons name="refresh" size={24} color="#fff" />
          <Text style={{ color: '#fff' }}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TimerScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  timerDisplayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerDisplay: {
    fontSize: 64,
    fontWeight: '300',
    color: colors.onSurface,
    fontFamily: 'Quicksand-Regular',
  },
  timerInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  timerInput: {
    width: 60,
    height: 60,
    textAlign: 'center',
    fontSize: 28,
    color: colors.onSurface,
    backgroundColor: colors.secondary,
    borderRadius: 8,
    marginHorizontal: 5,
    fontFamily: 'Quicksand-Regular',
  },
  timerInputSeparator: {
    fontSize: 28,
    color: colors.onSurface,
    fontFamily: 'Quicksand-Regular',
  },
  timerButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  timerButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
