import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const colors = {
  background: '#000000',
  onSurface: '#ffffff',
  primary: '#ffffff',
};

const StopwatchScreen = () => (
  <View style={styles.screenContainer}>
    <View style={styles.timeContainer}>
      <Text style={styles.timeText}>00:00:00.00</Text>
      <TouchableOpacity style={styles.timerButton}>
        <Ionicons name="play" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  </View>
);

export default StopwatchScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 64,
    fontWeight: '300',
    color: colors.onSurface,
    fontFamily: 'Quicksand-Regular',
    marginRight: 20,
  },
  timerButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
