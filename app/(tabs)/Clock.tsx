import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const colors = {
  background: '#000000',
  onSurface: '#ffffff',
};

const ClockScreen = () => (
  <View style={styles.screenContainer}>
    <View style={styles.timeContainer}>
      <Text style={styles.timeText}>10:09:41</Text>
      <Text style={styles.dateText}>Mon, Sep 1</Text>
    </View>
  </View>
);

export default ClockScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  timeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 64,
    fontWeight: '300',
    color: colors.onSurface,
    fontFamily: 'Quicksand-Regular',
  },
  dateText: {
    fontSize: 24,
    color: colors.onSurface,
    fontFamily: 'Quicksand-Regular',
  },
});
