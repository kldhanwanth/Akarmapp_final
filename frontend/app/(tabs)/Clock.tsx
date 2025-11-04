import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  ScrollView,
} from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

// --- CONSTANTS ---
const CLOCK_SIZE = Dimensions.get('window').width * 0.7;
const CLOCK_CENTER = CLOCK_SIZE / 2;
const MINUTE_HAND_LENGTH = CLOCK_CENTER * 0.7;
const HOUR_HAND_LENGTH = CLOCK_CENTER * 0.5;
const SECONDS_HAND_LENGTH = CLOCK_CENTER * 0.8;

const colors = {
  background: '#000000',
  surface: '#1a1a1a',
  onSurface: '#ffffff',
  primary: '#ffffff',
  secondary: '#808080',
};

// --- UTILITY FUNCTIONS ---

interface ClockTime {
  time: string;
  date: string;
  hours: number;
  minutes: number;
  seconds: number;
}

/** Fetches time data for local or a specified timezone */
const getTimeData = (timezone: string | null = null): ClockTime => {
  const now = new Date();
  
  let hours: number, minutes: number, seconds: number;
  let timeString: string, dateString: string;

  if (timezone) {
    // For specific timezone
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      
      const dateFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });

      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
      }).formatToParts(now);

      hours = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
      minutes = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
      seconds = parseInt(parts.find(p => p.type === 'second')?.value || '0');

      timeString = formatter.format(now);
      dateString = dateFormatter.format(now);
    } catch (error) {
      console.error('Error formatting timezone:', timezone, error);
      hours = 0;
      minutes = 0;
      seconds = 0;
      timeString = '--:--';
      dateString = 'Invalid';
    }
  } else {
    // For local time
    hours = now.getHours();
    minutes = now.getMinutes();
    seconds = now.getSeconds();

    timeString = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    dateString = now.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  return {
    time: timeString,
    date: dateString,
    hours,
    minutes,
    seconds,
  };
};

/** Calculates time difference between local and target timezone in hours */
const getTimeDifference = (targetTimezone: string): string => {
  try {
    const now = new Date();
    
    // Get hours for both timezones
    const localParts = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
    }).formatToParts(now);
    
    const targetParts = new Intl.DateTimeFormat('en-US', {
      timeZone: targetTimezone,
      hour: 'numeric',
      hour12: false,
    }).formatToParts(now);

    const localHour = parseInt(localParts.find(p => p.type === 'hour')?.value || '0');
    const targetHour = parseInt(targetParts.find(p => p.type === 'hour')?.value || '0');

    let diff = targetHour - localHour;

    // Handle day boundary crossing
    if (diff > 12) diff -= 24;
    if (diff < -12) diff += 24;

    if (diff === 0) return 'Same';
    if (diff > 0) return `+${diff}h`;
    return `${diff}h`;
  } catch (error) {
    console.error('Error calculating time difference:', error);
    return '—';
  }
};

/** Calculates coordinates for clock hands */
const timeToCoordinates = (
  timeData: ClockTime,
  length: number,
  unit: 'hour' | 'minute' | 'second'
) => {
  let value: number, max: number;

  if (unit === 'hour') {
    value = (timeData.hours % 12) + timeData.minutes / 60;
    max = 12;
  } else if (unit === 'minute') {
    value = timeData.minutes + timeData.seconds / 60;
    max = 60;
  } else {
    value = timeData.seconds;
    max = 60;
  }

  const angle = (value / max) * 360 - 90;
  const radians = (angle * Math.PI) / 180;

  const x = CLOCK_CENTER + length * Math.cos(radians);
  const y = CLOCK_CENTER + length * Math.sin(radians);

  return { x1: CLOCK_CENTER, y1: CLOCK_CENTER, x2: x, y2: y };
};

// --- UI COMPONENTS ---

interface TimezoneItemProps {
  city: string;
  timezone: string;
}

const TimezoneItem = React.memo(({ city, timezone }: TimezoneItemProps) => {
  const [timeData, setTimeData] = useState(getTimeData(timezone));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeData(getTimeData(timezone));
    }, 1000);

    return () => clearInterval(interval);
  }, [timezone]);

  const diffText = getTimeDifference(timezone);

  return (
    <View style={styles.worldClockItem}>
      <View style={styles.worldClockLeft}>
        <View style={styles.clockDetails}>
          <Text style={styles.timezoneCityText}>{city}</Text>
          <Text style={styles.timezoneDiffText}>{diffText}</Text>
        </View>
        <Text style={styles.worldClockDateText}>{timeData.date}</Text>
      </View>
      <Text style={styles.worldClockTimeText}>{timeData.time}</Text>
    </View>
  );
});

const AnalogClock = React.memo(({ timeData }: { timeData: ClockTime }) => {
  const hourCoords = timeToCoordinates(timeData, HOUR_HAND_LENGTH, 'hour');
  const minuteCoords = timeToCoordinates(timeData, MINUTE_HAND_LENGTH, 'minute');
  const secondCoords = timeToCoordinates(timeData, SECONDS_HAND_LENGTH, 'second');

  return (
    <View style={styles.analogClockContainer}>
      <Svg height={CLOCK_SIZE} width={CLOCK_SIZE} viewBox={`0 0 ${CLOCK_SIZE} ${CLOCK_SIZE}`}>
        {/* Clock Face */}
        <Circle
          cx={CLOCK_CENTER}
          cy={CLOCK_CENTER}
          r={CLOCK_CENTER - 2}
          stroke={colors.secondary}
          strokeWidth="1"
          fill={colors.background}
        />

        {/* Hour Markers */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const markerRadius = CLOCK_CENTER - 10;
          return (
            <Circle
              key={i}
              cx={CLOCK_CENTER + markerRadius * Math.cos(angle)}
              cy={CLOCK_CENTER + markerRadius * Math.sin(angle)}
              r={2}
              fill={colors.secondary}
            />
          );
        })}

        {/* Hour Hand */}
        <Line
          x1={hourCoords.x1}
          y1={hourCoords.y1}
          x2={hourCoords.x2}
          y2={hourCoords.y2}
          stroke={colors.onSurface}
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Minute Hand */}
        <Line
          x1={minuteCoords.x1}
          y1={minuteCoords.y1}
          x2={minuteCoords.x2}
          y2={minuteCoords.y2}
          stroke={colors.onSurface}
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Second Hand */}
        <Line
          x1={secondCoords.x1}
          y1={secondCoords.y1}
          x2={secondCoords.x2}
          y2={secondCoords.y2}
          stroke="#D9534F"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* Center Pin */}
        <Circle cx={CLOCK_CENTER} cy={CLOCK_CENTER} r="4" fill={colors.onSurface} />
      </Svg>
    </View>
  );
});

// --- MAIN SCREEN COMPONENT ---

const ClockScreen = () => {
  const [timeData, setTimeData] = useState(getTimeData());
  const worldClocks = [
    { id: 'ny', city: 'New York', timezone: 'America/New_York' },
    { id: 'lon', city: 'London', timezone: 'Europe/London' },
    { id: 'tokyo', city: 'Tokyo', timezone: 'Asia/Tokyo' },
    { id: 'syd', city: 'Sydney', timezone: 'Australia/Sydney' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeData(getTimeData());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const renderWorldClockItem = useCallback(
    ({ item }: { item: typeof worldClocks[0] }) => {
      return <TimezoneItem city={item.city} timezone={item.timezone} />;
    },
    []
  );

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      style={styles.screenContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* === LOCAL CLOCK SECTION === */}
      <View style={styles.localClockSection}>
        <View style={styles.localTimeDisplay}>
          <Text style={styles.localDigitalTime}>{timeData.time}</Text>
          <Text style={styles.localDateText}>{timeData.date}</Text>
        </View>
        <AnalogClock timeData={timeData} />
      </View>

      {/* === WORLD CLOCKS SECTION === */}
      <View style={styles.worldClockSection}>
        <Text style={styles.worldClockHeaderTitle}>World Clocks</Text>
        <FlatList
          data={worldClocks}
          keyExtractor={(item) => item.id}
          renderItem={renderWorldClockItem}
          scrollEnabled={false}
          contentContainerStyle={styles.worldClockListContainer}
        />
      </View>
    </ScrollView>
  );
};

export default ClockScreen;

// --- STYLES ---

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  localClockSection: {
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
    alignItems: 'center',
    minHeight: Dimensions.get('window').height * 0.75,
    justifyContent: 'center',
  },
  localTimeDisplay: {
    alignItems: 'center',
    marginBottom: 30,
  },
  localDigitalTime: {
    fontSize: 56,
    fontWeight: '300',
    color: colors.onSurface,
    fontFamily: 'Quicksand-Regular',
    letterSpacing: 2,
  },
  localDateText: {
    fontSize: 20,
    color: colors.secondary,
    fontFamily: 'Quicksand-Regular',
    marginTop: 8,
  },
  analogClockContainer: {
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  worldClockSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  worldClockHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.secondary,
    fontFamily: 'Quicksand-Regular',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  worldClockListContainer: {
    gap: 0,
  },
  worldClockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  worldClockLeft: {
    flex: 1,
  },
  clockDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timezoneCityText: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.onSurface,
    fontFamily: 'Quicksand-Regular',
  },
  timezoneDiffText: {
    fontSize: 14,
    color: '#D9534F',
    marginLeft: 10,
    fontFamily: 'Quicksand-Regular',
    fontWeight: '600',
  },
  worldClockTimeText: {
    fontSize: 32,
    fontWeight: '300',
    color: colors.onSurface,
    fontFamily: 'Quicksand-Regular',
  },
  worldClockDateText: {
    fontSize: 13,
    color: colors.secondary,
    fontFamily: 'Quicksand-Regular',
  },
});