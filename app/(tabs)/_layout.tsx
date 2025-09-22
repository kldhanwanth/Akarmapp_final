// app/(tabs)/_layout.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import your screen components
import AlarmScreen from './Alarm';
import ClockScreen from './Clock';
import TimerScreen from './Timer';
import StopwatchScreen from './Stopwatch';

// Define colors matching your theme
const colors = {
  primary: '#fff',
  secondary: '#808080',
  surface: '#1a1a1a',
  background: '#000',
  onSurface: '#fff',
};

const Tab = createBottomTabNavigator();

export default function TabsLayout() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help-circle-outline';

          switch (route.name) {
            case 'Alarm':
              iconName = focused ? 'alarm' : 'alarm-outline';
              break;
            case 'Clock':
              iconName = focused ? 'time' : 'time-outline';
              break;
            case 'Timer':
              iconName = focused ? 'timer' : 'timer-outline';
              break;
            case 'Stopwatch':
              iconName = focused ? 'stopwatch' : 'stopwatch-outline';
              break;
            default:
              iconName = 'help-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondary,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: 'transparent' },
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.onSurface, fontFamily: 'Quicksand-Regular' },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500', fontFamily: 'Quicksand-Regular' },
      })}
    >
      <Tab.Screen name="Alarm" component={AlarmScreen} />
      <Tab.Screen name="Clock" component={ClockScreen} />
      <Tab.Screen name="Timer" component={TimerScreen} />
      <Tab.Screen name="Stopwatch" component={StopwatchScreen} />
    </Tab.Navigator>
  );
}
