import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const colors = {
  background: '#000000',
  surface: '#1a1a1a',
  onSurface: '#ffffff',
  primary: '#ffffff',
  secondary: '#808080',
  action: '#D9534F', // Red for stop/reset
  start: '#5CB85C', // Green for start
};

// --- UTILITY FUNCTIONS ---

/** Formats total seconds into HH:MM:SS string */
const formatTime = (totalSeconds: number): string => {
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  const minutes = (Math.floor(totalSeconds / 60) % 60).toString().padStart(2, '0');
  const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

/** Parses input strings into total seconds */
const parseInputToSeconds = (h: string, m: string, s: string): number => {
  const hours = parseInt(h) || 0;
  const minutes = parseInt(m) || 0;
  const seconds = parseInt(s) || 0;
  return hours * 3600 + minutes * 60 + seconds;
};

// --- MAIN SCREEN COMPONENT ---

const TimerScreen = () => {
  const [hInput, setHInput] = useState('0');
  const [mInput, setMInput] = useState('0');
  const [sInput, setSInput] = useState('0');

  const [isRunning, setIsRunning] = useState(false);
  const [initialTime, setInitialTime] = useState(0); // Total time set by user
  const [timeLeft, setTimeLeft] = useState(0); // Time remaining

  // Use a ref to store the interval ID
  const intervalRef = useRef<number | null>(null);

  // --- HANDLERS ---

  const handleStart = useCallback(() => {
    const totalSeconds = parseInputToSeconds(hInput, mInput, sInput);

    if (totalSeconds <= 0 && timeLeft <= 0) {
      Alert.alert('Error', 'Please set a time greater than zero.');
      return;
    }

    if (!isRunning) {
      // If the timer is starting fresh
      if (timeLeft === 0) {
        setInitialTime(totalSeconds);
        setTimeLeft(totalSeconds);
      }
      setIsRunning(true);
    }
  }, [hInput, mInput, sInput, isRunning, timeLeft]);

  const handlePause = useCallback(() => {
    if (isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsRunning(false);
    }
  }, [isRunning]);

  const handleReset = useCallback(() => {
    handlePause();
    setTimeLeft(0);
    setInitialTime(0);
    setHInput('0');
    setMInput('0');
    setSInput('0');
  }, [handlePause]);

  // --- TIME COUNTDOWN EFFECT ---
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            handlePause();
            Alert.alert('Timer Finished', 'Your countdown has ended!');
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000); // Decrement every 1 second
    } else if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, handlePause]);

  // --- INPUT HANDLING ---
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, text: string, max: number) => {
    // Only allow numeric input
    const cleanedText = text.replace(/[^0-9]/g, '');
    let num = parseInt(cleanedText) || 0;
    
    if (num > max) {
        // Prevent typing numbers larger than max allowed (e.g., 99 for minutes/seconds)
        setter(max.toString());
        return;
    }
    
    setter(cleanedText);
  };
  
  // Disable inputs while timer is running
  const inputsDisabled = isRunning || timeLeft > 0;

  // Determine control button states
  const showStartButton = !isRunning && timeLeft === 0;
  const showPauseButton = isRunning;
  const showResumeButton = !isRunning && timeLeft > 0;
  const showResetButton = timeLeft > 0;

  return (
    <View style={styles.screenContainer}>
      {/* 1. Timer Input/Display Area */}
      <View style={styles.timerDisplayContainer}>
        {timeLeft > 0 ? (
          // Display Countdown
          <Text style={styles.timerDisplay}>{formatTime(timeLeft)}</Text>
        ) : (
          // Display Input Fields
          <View style={styles.timerInputRow}>
            <TextInput
              style={styles.timerInput}
              keyboardType="number-pad"
              placeholder="H"
              value={hInput}
              onChangeText={(text) => handleInputChange(setHInput, text, 99)}
              maxLength={2}
              editable={!inputsDisabled}
            />
            <Text style={styles.timerInputSeparator}>:</Text>
            <TextInput
              style={styles.timerInput}
              keyboardType="number-pad"
              placeholder="M"
              value={mInput}
              onChangeText={(text) => handleInputChange(setMInput, text, 59)}
              maxLength={2}
              editable={!inputsDisabled}
            />
            <Text style={styles.timerInputSeparator}>:</Text>
            <TextInput
              style={styles.timerInput}
              keyboardType="number-pad"
              placeholder="S"
              value={sInput}
              onChangeText={(text) => handleInputChange(setSInput, text, 59)}
              maxLength={2}
              editable={!inputsDisabled}
            />
          </View>
        )}
      </View>

      {/* 2. Control Buttons */}
      <View style={styles.timerButtonContainer}>
        {/* Left Button: Reset */}
        <TouchableOpacity
          style={[
            styles.controlButton,
            { opacity: showResetButton ? 1 : 0.4, backgroundColor: colors.surface },
          ]}
          onPress={handleReset}
          disabled={!showResetButton}
        >
          <Text style={styles.controlText}>Reset</Text>
        </TouchableOpacity>

        {/* Right Button: Start / Pause / Resume */}
        <TouchableOpacity
          style={[
            styles.controlButton,
            showPauseButton ? styles.pauseButton : styles.startButton,
            {
              opacity: (timeLeft === 0 && parseInputToSeconds(hInput, mInput, sInput) === 0) ? 0.4 : 1,
            },
          ]}
          onPress={showPauseButton ? handlePause : handleStart}
          disabled={timeLeft === 0 && parseInputToSeconds(hInput, mInput, sInput) === 0}
        >
          <Ionicons
            name={showPauseButton ? 'pause' : 'play'}
            size={24}
            color={showPauseButton ? colors.background : colors.background}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TimerScreen;

// --- STYLES ---

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    alignItems: 'center',
  },
  timerDisplayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  timerDisplay: {
    fontSize: 72,
    fontWeight: '300',
    color: colors.onSurface,
    fontFamily: 'Quicksand-Regular',
  },
  timerInputRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerInput: {
    width: 80,
    height: 80,
    textAlign: 'center',
    fontSize: 40,
    color: colors.onSurface,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginHorizontal: 5,
    fontFamily: 'Quicksand-Regular',
    padding: 0,
  },
  timerInputSeparator: {
    fontSize: 32,
    color: colors.onSurface,
    fontFamily: 'Quicksand-Regular',
    paddingHorizontal: 5,
  },
  timerButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 50,
  },
  controlButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlText: {
    fontSize: 18,
    color: colors.secondary,
    fontFamily: 'Quicksand-Regular',
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: colors.start,
  },
  pauseButton: {
    backgroundColor: colors.action,
  },
});
