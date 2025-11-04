import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const colors = {
  background: '#000000',
  surface: '#1a1a1a',
  onSurface: '#ffffff',
  primary: '#ffffff', // White
  secondary: '#808080', // Gray
  action: '#D9534F', // Red for stop/reset
  lap: '#5CB85C', // Green for start/lap
};

// --- UTILITY FUNCTIONS ---

/** Formats milliseconds into HH:MM:SS.ms string */
const formatTime = (totalMilliseconds: number): { display: string; milliseconds: string } => {
  const milliseconds = Math.floor(totalMilliseconds % 1000)
    .toString()
    .padStart(3, '0')
    .slice(0, 2); // Show only two digits for milliseconds
  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  const minutes = (Math.floor(totalSeconds / 60) % 60).toString().padStart(2, '0');
  const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');

  return {
    display: `${hours}:${minutes}:${seconds}`,
    milliseconds: milliseconds,
  };
};

// --- MAIN SCREEN COMPONENT ---

const StopwatchScreen = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  
  // Use a ref to store the interval ID
  const intervalRef = useRef<number | null>(null);
  // Use a ref to track the start time for accuracy
  const startTimeRef = useRef<number>(0); 

  // --- HANDLERS ---

  const handleStart = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      startTimeRef.current = Date.now() - time; // Adjust start time for paused duration
      
      intervalRef.current = setInterval(() => {
        setTime(Date.now() - startTimeRef.current);
      }, 10); // Update every 10 milliseconds for smooth millisecond count
    }
  }, [isRunning, time]);

  const handleStop = useCallback(() => {
    if (isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsRunning(false);
    }
  }, [isRunning]);

  const handleReset = useCallback(() => {
    handleStop();
    setTime(0);
    setLaps([]);
  }, [handleStop]);

  const handleLap = useCallback(() => {
    if (isRunning) {
      // Record the current time as a new lap
      // Laps are stored in reverse order so the newest (Lap 1) is at the top
      setLaps(prevLaps => [time, ...prevLaps]);
    }
  }, [isRunning, time]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formattedTime = formatTime(time);

  // --- RENDER FUNCTIONS ---

  const renderLapItem = ({ item, index }: { item: number; index: number }) => {
    const lapNumber = laps.length - index;
    const formattedTotal = formatTime(item);

    // Calculate Lap Time (Difference from previous lap or start)
    const previousLapTime = index < laps.length - 1 ? laps[index + 1] : 0;
    const lapDuration = item - previousLapTime;
    const formattedLapDuration = formatTime(lapDuration);
    
    return (
      <View style={styles.lapItem}>
        <Text style={[styles.lapText, { color: colors.secondary }]}>Lap {lapNumber}</Text>
        <Text style={[styles.lapTime, { color: colors.onSurface }]}>
          {formattedLapDuration.display}
          <Text style={styles.lapMillis}>.{formattedLapDuration.milliseconds}</Text>
        </Text>
        <Text style={[styles.lapTotal, { color: colors.onSurface }]}>
          {formattedTotal.display}
          <Text style={styles.lapMillis}>.{formattedTotal.milliseconds}</Text>
        </Text>
      </View>
    );
  };

  // Determine control button state
  const leftAction = isRunning ? handleLap : handleReset;
  const rightAction = isRunning ? handleStop : handleStart;
  const rightButtonStyles = isRunning ? styles.stopButton : styles.startButton;
  const rightTextStyles = isRunning ? styles.stopText : styles.startText;
  const leftDisabled = !isRunning && time === 0;

  return (
    <View style={styles.screenContainer}>
      {/* 1. Main Display */}
      <View style={styles.displayContainer}>
        <Text style={styles.mainTimeDisplay}>
          {formattedTime.display}
          <Text style={styles.mainMillisDisplay}>.{formattedTime.milliseconds}</Text>
        </Text>
      </View>

      {/* 2. Control Buttons */}
      <View style={styles.controlRow}>
        {/* Left Button: Reset / Lap (Disabled when at 0) */}
        <TouchableOpacity 
          style={[
            styles.controlButton, 
            { opacity: leftDisabled ? 0.4 : 1, backgroundColor: colors.surface }
          ]} 
          onPress={leftAction}
          disabled={leftDisabled}
        >
          <Text style={styles.controlText}>
            {isRunning ? 'Lap' : 'Reset'}
          </Text>
        </TouchableOpacity>

        {/* Right Button: Start / Stop */}
        <TouchableOpacity 
          style={[
            styles.controlButton, 
            rightButtonStyles
          ]} 
          onPress={rightAction}
        >
          <Text style={[
            styles.controlText, 
            rightTextStyles
          ]}>
            {isRunning ? 'Stop' : 'Start'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* 3. Lap List */}
      <FlatList
        data={laps}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderLapItem}
        style={styles.lapList}
        inverted // Display newest lap at the top
      />
    </View>
  );
};

export default StopwatchScreen;

// --- STYLES ---

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
  },
  displayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  mainTimeDisplay: {
    fontSize: 72,
    fontWeight: '300',
    color: colors.onSurface,
    fontFamily: 'Quicksand-Regular',
  },
  mainMillisDisplay: {
    fontSize: 48,
    color: colors.secondary,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    width: '100%',
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
    backgroundColor: colors.lap,
  },
  startText: {
    color: colors.background,
  },
  stopButton: {
    backgroundColor: colors.action,
  },
  stopText: {
    color: colors.background,
  },
  // --- Lap List Styles ---
  lapList: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: colors.surface,
    marginBottom: 20,
  },
  lapItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
    alignItems: 'center',
  },
  lapText: {
    fontSize: 18,
    fontFamily: 'Quicksand-Regular',
  },
  lapTotal: {
    fontSize: 16,
    fontFamily: 'Quicksand-Regular',
    minWidth: 90, // Ensure alignment
    textAlign: 'right',
  },
  lapTime: {
    fontSize: 16,
    fontFamily: 'Quicksand-Regular',
    minWidth: 90, // Ensure alignment
    textAlign: 'right',
  },
  lapMillis: {
    fontSize: 12,
  },
});
