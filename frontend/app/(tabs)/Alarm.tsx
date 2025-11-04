import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Switch,
  Alert,
  TextInput,
  Modal,
  Pressable,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid, DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { fetchAlarmPrediction, AlarmPlan } from '../../src/api/AlarmPredictionService';
import { saveFeedbackRating, logSnoozeEvent, initializeDatabase } from '../../src/api/DatabaseService';
import { alarmService } from '../../src/services/AlarmService';
import { smartMediaPlayerService } from '../../src/services/SmartMediaPlayerService';
import { radioService, RadioStation } from '../../src/services/RadioService';
import { BackgroundAudioService } from '../../src/services/BackgroundAudioService';

initializeDatabase();

const colors = {
  background: '#000000',
  surface: '#1a1a1a',
  onSurface: '#ffffff',
  primary: '#ffffff',
  secondary: '#808080',
  danger: '#D9534F',
  success: '#5CB85C',
};

interface AlarmItem {
  id: string;
  time: string;
  enabled: boolean;
  prediction: AlarmPlan | null;
  snoozeCount: number;
  initialAlarmTime: string;
  mediaMode: 'Mood' | 'Radio' | 'Calendar';
  selectedMood?: MoodType;
  scheduledTime?: Date;
  hasCalendarConflict?: boolean;
  suggestedWakeTime?: Date;
  // Advanced preferences
  language?: 'English' | 'Tamil';
  selectedLanguages?: string[];
  ambientType?: 'Song' | 'Ambient Sound';
  radioOption?: 'Local' | 'Custom';
  selectedRadioStation?: string;
}

const MOCK_USER_ID = 1;

const MOCK_USER_LIFESTYLE = {
  sleep_duration_hours: 7.5,
  screen_time_before_bed_min: 65,
  light_activity_min: 90,
  is_weekend: 0,
  chronotype: 'standard',
};

const MOOD_OPTIONS = [
  { name: 'Energetic', color: '#FF6B6B' },
  { name: 'Calm', color: '#4ECDC4' },
  { name: 'Neutral', color: '#95A5A6' },
  { name: 'Dance', color: '#9B59B6' },
  { name: 'Motivational', color: '#F39C12' },
  { name: 'Love', color: '#E91E63' },
] as const;

const LANGUAGE_OPTIONS = [
  'English', 'Tamil'
];

type MoodType = typeof MOOD_OPTIONS[number]['name'];

const getDefaultAlarmTime = () => {
  const nextHour = new Date();
  nextHour.setSeconds(0, 0);
  nextHour.setMinutes(0);
  nextHour.setHours(nextHour.getHours() + 1);
  return nextHour;
};

const normalizeTimeToToday = (date: Date) => {
  const normalized = new Date();
  normalized.setSeconds(0, 0);
  normalized.setHours(date.getHours(), date.getMinutes(), 0, 0);
  return normalized;
};

// Circular Slider Component
interface CircularSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  activeColor?: string;
  inactiveColor?: string;
  knobColor?: string;
}

const CircularSlider: React.FC<CircularSliderProps> = ({
  value,
  onValueChange,
  min = 1,
  max = 10,
  size = 120,
  strokeWidth = 8,
  activeColor = '#6366F1',
  inactiveColor = '#E5E7EB',
  knobColor = '#FFFFFF',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [containerLayout, setContainerLayout] = useState({ x: 0, y: 0 });
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  
  // Convert value to angle (starting from top, going clockwise)
  const valueToAngle = (val: number) => {
    const normalized = (val - min) / (max - min);
    return normalized * 360 - 90; // Start from top (-90 degrees)
  };
  
  // Convert angle to value with better precision
  const angleToValue = (angle: number) => {
    // Normalize angle to 0-360 starting from top
    let normalizedAngle = angle + 90;
    if (normalizedAngle < 0) normalizedAngle += 360;
    if (normalizedAngle >= 360) normalizedAngle -= 360;
    
    const ratio = normalizedAngle / 360;
    const rawValue = min + ratio * (max - min);
    return Math.max(min, Math.min(max, Math.round(rawValue)));
  };
  
  const angle = valueToAngle(value);
  
  // Calculate knob position
  const angleRad = angle * (Math.PI / 180);
  const knobX = center + radius * Math.cos(angleRad);
  const knobY = center + radius * Math.sin(angleRad);
  
  // Calculate progress for SVG
  const progress = (value - min) / (max - min) * circumference;
  
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      setIsDragging(true);
    },
    onPanResponderMove: (evt) => {
      const { pageX, pageY } = evt.nativeEvent;
      
      // Calculate center position in screen coordinates
      const centerX = containerLayout.x + size / 2;
      const centerY = containerLayout.y + size / 2;
      
      // Calculate touch position relative to center
      const deltaX = pageX - centerX;
      const deltaY = pageY - centerY;
      
      // Calculate angle in degrees
      const angleRad = Math.atan2(deltaY, deltaX);
      const angleDeg = angleRad * (180 / Math.PI);
      
      const newValue = angleToValue(angleDeg);
      onValueChange(newValue);
    },
    onPanResponderRelease: () => {
      setIsDragging(false);
    },
  });

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size,
          height: size,
          position: 'relative',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        {...panResponder.panHandlers}
        onLayout={(event) => {
          const { x, y } = event.nativeEvent.layout;
          // Get absolute position on screen
          event.currentTarget.measure((fx, fy, width, height, px, py) => {
            setContainerLayout({ x: px, y: py });
          });
        }}
      >
        {/* Background and Progress Circles using SVG */}
        <Svg width={size} height={size} style={{ position: 'absolute' }}>
          {/* Background Circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={inactiveColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          
          {/* Progress Circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={activeColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            transform={`rotate(-90 ${center} ${center})`}
          />
        </Svg>
        
        {/* Knob */}
        <View
          style={{
            position: 'absolute',
            left: knobX - 12,
            top: knobY - 12,
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: isDragging ? '#4F46E5' : knobColor,
            borderWidth: 3,
            borderColor: activeColor,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: isDragging ? 4 : 2 },
            shadowOpacity: isDragging ? 0.4 : 0.25,
            shadowRadius: isDragging ? 6 : 4,
            elevation: isDragging ? 8 : 5,
            transform: [{ scale: isDragging ? 1.1 : 1 }],
          }}
        />
        
        {/* Center Value Display */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: activeColor,
              fontFamily: 'Quicksand-Regular',
            }}
          >
            {value}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: '#6B7280',
              fontFamily: 'Quicksand-Regular',
              marginTop: -4,
            }}
          >
            out of {max}
          </Text>
        </View>
      </View>
    </View>
  );
};

const calculateSleepDuration = (alarmTime: Date, bedtimeInput: string): number => {
  if (!bedtimeInput) return 7.5;

  const [bedtimeHours, bedtimeMinutes] = bedtimeInput.split(':').map(Number);
  if (isNaN(bedtimeHours) || isNaN(bedtimeMinutes)) return 7.5;

  const alarmTimeInMinutes = alarmTime.getHours() * 60 + alarmTime.getMinutes();
  let bedtimeInMinutes = bedtimeHours * 60 + bedtimeMinutes;

  if (bedtimeInMinutes < 300) bedtimeInMinutes += 24 * 60;

  let durationInMinutes = alarmTimeInMinutes - bedtimeInMinutes;
  if (durationInMinutes > 0) durationInMinutes -= 24 * 60;

  const durationHours = Math.abs(durationInMinutes) / 60;
  return Math.min(12.0, Math.max(4.0, durationHours));
};

// --- RINGING ALARM MODAL ---
interface RingingAlarmModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSnooze: (minutes: number) => void;
  currentAlarm: AlarmItem | null;
}

const RingingAlarmModal = ({ visible, onDismiss, onSnooze, currentAlarm }: RingingAlarmModalProps) => {
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (visible) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [visible]);

  const getSnoozeOptions = () => {
    if (currentAlarm?.prediction?.snooze_pattern) {
      const pattern = currentAlarm.prediction.snooze_pattern.split('-').map(p => p.trim());
      const nextIndex = currentAlarm.snoozeCount;
      
      if (nextIndex < pattern.length) {
        const nextStep = pattern[nextIndex];
        if (nextStep === 'LOUD') return [{ label: '2 min (LOUD)', value: 2 }];
        if (nextStep === 'DISMISS') return [{ label: 'Final Wake Up', value: 0 }];
        if (!isNaN(parseInt(nextStep))) {
          return [{ label: `${nextStep} min`, value: parseInt(nextStep) }];
        }
      }
    }
    return [
      { label: '5 min', value: 5 },
      { label: '10 min', value: 10 },
      { label: '15 min', value: 15 },
    ];
  };

  const getMediaModeDisplay = () => {
    if (!currentAlarm) return 'Alarm';
    
    switch (currentAlarm.mediaMode) {
      case 'Mood':
        return `🎵 ${currentAlarm.selectedMood} Music`;
      case 'Radio':
        return '📻 Radio Station';
      case 'Calendar':
        return '📅 Calendar Events';
      default:
        return 'Alarm';
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={() => {}}
    >
      <View style={ringingStyles.overlay}>
        <Animated.View style={[ringingStyles.container, { transform: [{ scale: pulseAnim }] }]}>
          <View style={ringingStyles.alarmIcon}>
            <Ionicons name="alarm" size={80} color={colors.danger} />
          </View>
          
          <Text style={ringingStyles.title}>🚨 ALARM RINGING! 🚨</Text>
          
          <Text style={ringingStyles.time}>
            {currentAlarm?.time || 'Unknown'}
          </Text>
          
          <Text style={ringingStyles.mediaAction}>
            {getMediaModeDisplay()}
          </Text>

          {currentAlarm?.prediction?.media_action && (
            <Text style={ringingStyles.subAction}>
              {currentAlarm.prediction.media_action}
            </Text>
          )}

          <View style={ringingStyles.buttonContainer}>
            <TouchableOpacity
              style={[ringingStyles.button, ringingStyles.dismissButton]}
              onPress={onDismiss}
            >
              <Ionicons name="stop-circle" size={24} color="white" />
              <Text style={ringingStyles.buttonText}>DISMISS</Text>
            </TouchableOpacity>

            <View style={ringingStyles.snoozeContainer}>
              {getSnoozeOptions().map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[ringingStyles.button, ringingStyles.snoozeButton]}
                  onPress={() => onSnooze(option.value)}
                >
                  <Ionicons name="time" size={20} color="white" />
                  <Text style={ringingStyles.buttonText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// --- FEEDBACK MODAL ---
interface FeedbackModalProps {
  visible: boolean;
  onSubmit: (rating: number) => void;
  onSkip: () => void;
}

const FeedbackModal = ({ visible, onSubmit, onSkip }: FeedbackModalProps) => {
  const [rating, setRating] = useState(5); // Start with middle value

  const handleSubmit = () => {
    onSubmit(rating);
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onSkip}>
      <View style={modalStyles.centeredView}>
        <View style={modalStyles.modalView}>
          <Text style={modalStyles.modalTitle}>Rate Your Wake-Up</Text>
          <Text style={modalStyles.modalText}>
            How ready do you feel on a scale of 1-10?
          </Text>
          
          <View style={modalStyles.sliderContainer}>
            <CircularSlider
              value={rating}
              onValueChange={setRating}
              min={1}
              max={10}
              size={140}
              strokeWidth={10}
              activeColor={colors.primary}
              inactiveColor={colors.secondary}
              knobColor={colors.background}
            />
          </View>
          
          <View style={modalStyles.buttonRow}>
            <TouchableOpacity
              style={[modalStyles.button, modalStyles.skipButton]}
              onPress={onSkip}
            >
              <Text style={modalStyles.buttonText}>Skip</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[modalStyles.button, modalStyles.submitButton]}
              onPress={handleSubmit}
            >
              <Text style={modalStyles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// --- MAIN SCREEN ---
const AlarmScreen = () => {
  const [alarms, setAlarms] = useState<AlarmItem[]>([]);
  const [alarmTime, setAlarmTime] = useState<Date>(() => getDefaultAlarmTime());
  const [isIosPickerVisible, setIosPickerVisible] = useState(false);
  const [iosDraftTime, setIosDraftTime] = useState<Date>(() => getDefaultAlarmTime());
  
  const [bedtimeInput, setBedtimeInput] = useState('00:00');
  const [mediaMode, setMediaMode] = useState<'Mood' | 'Radio' | 'Calendar'>('Mood');
  const [selectedMood, setSelectedMood] = useState<MoodType>('Energetic');
  
  // Advanced preferences
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English']);
  const [ambientType, setAmbientType] = useState<'Song' | 'Ambient Sound'>('Song');
  const [radioOption, setRadioOption] = useState<'Local' | 'Custom'>('Local');
  const [selectedRadioStation, setSelectedRadioStation] = useState<string>('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // Language selection modal
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showRadioStations, setShowRadioStations] = useState(false);
  const [availableStations, setAvailableStations] = useState<RadioStation[]>([]);
  
  const [isSettingMode, setIsSettingMode] = useState(false);
  
  const [activeAlarmId, setActiveAlarmId] = useState<string | null>(null);
  const [showRingingModal, setShowRingingModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  
  // Background audio state
  const [audioState, setAudioState] = useState(BackgroundAudioService.getPlaybackState());
  const [showAudioControls, setShowAudioControls] = useState(false);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Demo API Keys - For demonstration purposes only
  // Replace these with your actual API keys
  const DEMO_SPOTIFY_CLIENT_ID = 'your_spotify_client_id_here';
  const DEMO_SPOTIFY_CLIENT_SECRET = 'your_spotify_client_secret_here';
  const DEMO_GOOGLE_CALENDAR_TOKEN = 'your_google_calendar_token_here';

  const currentAlarm = alarms.find((a) => a.id === activeAlarmId) || null;

  // Initialize alarm service
  useEffect(() => {
    alarmService.setAlarmCallback(async (alarmId: string) => {
      console.log('Alarm triggered:', alarmId);
      setActiveAlarmId(alarmId);
      setShowRingingModal(true);
      
      // Start intelligent background audio
      const triggeredAlarm = alarms.find(a => a.id === alarmId);
      if (triggeredAlarm && triggeredAlarm.mediaMode === 'Mood' && triggeredAlarm.selectedMood) {
        const audioStarted = await BackgroundAudioService.startAlarm({
          mood: triggeredAlarm.selectedMood,
          languages: triggeredAlarm.selectedLanguages || ['Tamil'],
          volume: 0.7,
          fadeInDuration: 3000,
          maxDuration: 10, // Auto-stop after 10 minutes
        });
        
        if (audioStarted) {
          console.log('🎵 Background audio started for alarm');
        }
      }
    });

    // Load radio stations
    const loadRadioStations = () => {
      const localStations = radioService.getLocalStations();
      const internationalStations = radioService.getAvailableStations();
      setAvailableStations([...localStations, ...internationalStations]);
    };

    loadRadioStations();

    return () => {
      alarmService.clearAllAlarms();
    };
  }, []);

  // Monitor background audio state
  useEffect(() => {
    const interval = setInterval(() => {
      const newAudioState = BackgroundAudioService.getPlaybackState();
      setAudioState(newAudioState);
      setShowAudioControls(newAudioState.isPlaying);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isIosPickerVisible) {
      setIosDraftTime(alarmTime);
    }
  }, [alarmTime, isIosPickerVisible]);

  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleAlarm = async (id: string) => {
    const alarm = alarms.find(a => a.id === id);
    if (!alarm) return;

    if (alarm.enabled) {
      // Disable alarm
      alarmService.clearAlarm(id);
      setAlarms(prev => prev.map(a => 
        a.id === id ? { ...a, enabled: false } : a
      ));
      showSuccessToast('Alarm disabled');
    } else {
      // Enable alarm
      if (alarm.scheduledTime) {
        await alarmService.scheduleAlarm(id, alarm.scheduledTime, alarm.mediaMode, alarm.selectedMood, false, {
          ambientType: alarm.ambientType,
          selectedLanguages: alarm.selectedLanguages,
          radioOption: alarm.radioOption,
          selectedRadioStation: alarm.selectedRadioStation,
        });
        setAlarms(prev => prev.map(a => 
          a.id === id ? { ...a, enabled: true, snoozeCount: 0 } : a
        ));
        showSuccessToast('Alarm enabled');
      }
    }
  };

  const handleAlarmDismiss = async () => {
    if (!currentAlarm) return;
    
    // Stop background audio service if playing
    if (audioState.isPlaying) {
      await BackgroundAudioService.stopAlarm();
    }
    
    await alarmService.stopAlarm();
    setShowRingingModal(false);
    
    // Disable the alarm after it rings
    setAlarms(prev => prev.map(a => 
      a.id === currentAlarm.id ? { ...a, enabled: false } : a
    ));
    
    setShowFeedbackModal(true);
  };

  const handleAlarmSnooze = async (minutes: number) => {
    if (!currentAlarm || minutes === 0) {
      handleAlarmDismiss();
      return;
    }

    try {
      // Snooze background audio if playing
      if (audioState.isPlaying) {
        await BackgroundAudioService.snoozeAlarm(minutes);
      }
      
      await alarmService.snoozeAlarm(currentAlarm.id, minutes);
      
      // Log snooze event
      if (currentAlarm.prediction) {
        logSnoozeEvent(minutes, currentAlarm.id, currentAlarm.prediction.prediction_score);
      }
      
      // Update snooze count
      setAlarms(prev => prev.map(a => 
        a.id === currentAlarm.id ? { ...a, snoozeCount: a.snoozeCount + 1 } : a
      ));
      
      setShowRingingModal(false);
      showSuccessToast(`Alarm snoozed for ${minutes} minutes`);
      
    } catch (error) {
      console.error('Error snoozing alarm:', error);
      Alert.alert('Error', 'Failed to snooze alarm');
    }
  };

  const handleFeedbackSubmit = (rating: number) => {
    if (currentAlarm) {
      saveFeedbackRating(rating, {
        alarmId: currentAlarm.id,
        time: currentAlarm.time,
        mediaMode: currentAlarm.mediaMode,
        finalSnoozeCount: currentAlarm.snoozeCount,
        predictionScore: currentAlarm.prediction?.prediction_score,
      });
      showSuccessToast('Thank you for your feedback!');
    }
    setShowFeedbackModal(false);
    setActiveAlarmId(null);
  };

  const handleFeedbackSkip = () => {
    setShowFeedbackModal(false);
    setActiveAlarmId(null);
  };

  // Background Audio Control Functions
  const handleStopAudio = async () => {
    await BackgroundAudioService.stopAlarm();
    setShowAudioControls(false);
  };

  const handleSnoozeAudio = async () => {
    await BackgroundAudioService.snoozeAlarm(5); // 5 minute snooze
  };

  const handleNextTrack = async () => {
    await BackgroundAudioService.getNextTrack();
  };

  const handleVolumeChange = async (volume: number) => {
    await BackgroundAudioService.setVolume(volume);
  };

  const openTimePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: alarmTime,
        mode: 'time',
        is24Hour: false,
        display: 'clock',
        onChange: (event: DateTimePickerEvent, selectedDate?: Date) => {
          if (event.type === 'set' && selectedDate) {
            const normalized = normalizeTimeToToday(selectedDate);
            setAlarmTime(normalized);
            setIsSettingMode(true);
          }
        },
      });
    } else {
      setIosDraftTime(alarmTime);
      setIosPickerVisible(true);
    }
  };

  const handleIosTimeChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      setIosDraftTime(normalizeTimeToToday(selectedDate));
    }
  };

  const confirmIosTimeSelection = () => {
    setAlarmTime(iosDraftTime);
    setIosPickerVisible(false);
    setIsSettingMode(true);
  };

  const cancelIosTimeSelection = () => {
    setIosDraftTime(alarmTime);
    setIosPickerVisible(false);
  };

  const handleCreateAlarm = async () => {
    const currentDate = new Date(alarmTime);
    const formattedTime = currentDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const alarmTimeStr = currentDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });

    const calculatedDuration = calculateSleepDuration(currentDate, bedtimeInput);

    try {
      // Get AI prediction
      const predictionInput = {
        user_id: MOCK_USER_ID,
        ...MOCK_USER_LIFESTYLE,
        alarm_time: alarmTimeStr,
        bedtime: bedtimeInput || 'N/A',
        sleep_duration_hours: calculatedDuration,
        user_wake_up_mode: mediaMode,
        user_selected_mood: mediaMode === 'Mood' ? selectedMood : 'N/A',
      };

      const prediction = await fetchAlarmPrediction(predictionInput as any);
      
      // Create new alarm
      const newAlarm: AlarmItem = {
        id: Date.now().toString(),
        time: formattedTime,
        enabled: true,
        prediction: prediction || null,
        snoozeCount: 0,
        initialAlarmTime: formattedTime,
        mediaMode,
        selectedMood,
        scheduledTime: currentDate,
        // Advanced preferences
        ambientType,
        selectedLanguages,
        radioOption,
        selectedRadioStation,
      };

      // Schedule the alarm with media preferences
      const selectedStation = availableStations.find(station => station.name === selectedRadioStation);
      const preferences = {
        ambientType,
        selectedLanguages,
        radioOption,
        selectedRadioStation: selectedStation?.name || selectedRadioStation,
        radioStation: selectedStation,
      };
      await alarmService.scheduleAlarm(newAlarm.id, currentDate, mediaMode, selectedMood, false, preferences);

      // Disable other alarms and add new one
      setAlarms(prev => [
        ...prev.map(a => ({ ...a, enabled: false })),
        newAlarm
      ]);

      setIsSettingMode(false);

  // Don't reset the time - keep it for potential next alarm
  // setAlarmTime(getDefaultAlarmTime()); // Removed this line

      const now = new Date();
      let triggerTime = new Date(currentDate);
      if (triggerTime.getTime() <= now.getTime()) {
        triggerTime.setDate(triggerTime.getDate() + 1);
      }
      
      const timeDiffMin = Math.round((triggerTime.getTime() - now.getTime()) / 60000);
      
      showSuccessToast(
        prediction 
          ? `AI alarm set for ${timeDiffMin} minutes from now!`
          : `Alarm set for ${timeDiffMin} minutes from now!`
      );
      
    } catch (error) {
      console.error('Error creating alarm:', error);
      Alert.alert('Error', 'Failed to create alarm');
      setIsSettingMode(false);
    }
  };

  const deleteAlarm = (id: string) => {
    alarmService.clearAlarm(id);
    setAlarms(prev => prev.filter(a => a.id !== id));
    showSuccessToast('Alarm deleted');
  };

  const renderAlarmItem = ({ item }: { item: AlarmItem }) => (
    <View style={styles.alarmItem}>
      <TouchableOpacity 
        style={styles.alarmContent}
        onLongPress={() => {
          Alert.alert(
            'Delete Alarm',
            `Delete alarm for ${item.time}?`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => deleteAlarm(item.id) }
            ]
          );
        }}
      >
        <Text style={styles.alarmTime}>{item.time}</Text>
        <Text style={styles.alarmLabel}>
          {item.enabled 
            ? (item.prediction?.strategy || 'Alarm Set') 
            : 'Alarm Off'
          }
        </Text>
        {item.prediction && (
          <Text style={styles.predictionText}>
            {item.mediaMode}{item.mediaMode === 'Mood' ? ` (${item.selectedMood})` : ''}
            {item.snoozeCount > 0 && ` • Snoozed ${item.snoozeCount}x`}
          </Text>
        )}
      </TouchableOpacity>
      
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
      {/* Toast Message */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Background Audio Controls */}
      {showAudioControls && audioState.currentTrack && (
        <View style={styles.audioControlsContainer}>
          <View style={styles.audioInfoRow}>
            <View style={styles.audioTrackInfo}>
              <Text style={styles.audioTrackName} numberOfLines={1}>
                🎵 {audioState.currentTrack.name}
              </Text>
              <Text style={styles.audioArtistName} numberOfLines={1}>
                by {audioState.currentTrack.artist}
              </Text>
              <Text style={styles.audioMoodInfo}>
                {audioState.mood} • {audioState.language}
              </Text>
            </View>
            
            <View style={styles.audioControlButtons}>
              <TouchableOpacity 
                style={styles.audioControlButton}
                onPress={handleNextTrack}
              >
                <Ionicons name="play-skip-forward" size={20} color={colors.primary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.audioControlButton}
                onPress={handleSnoozeAudio}
              >
                <Ionicons name="alarm" size={20} color={colors.secondary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.audioControlButton, styles.stopButton]}
                onPress={handleStopAudio}
              >
                <Ionicons name="stop" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.volumeContainer}>
            <Ionicons name="volume-low" size={16} color={colors.secondary} />
            <View style={styles.volumeSliderContainer}>
              <View style={styles.volumeTrack}>
                <View 
                  style={[
                    styles.volumeFill, 
                    { width: `${audioState.volume * 100}%` }
                  ]} 
                />
              </View>
            </View>
            <Ionicons name="volume-high" size={16} color={colors.secondary} />
          </View>
        </View>
      )}

      {/* Ringing Alarm Modal */}
      <RingingAlarmModal
        visible={showRingingModal}
        onDismiss={handleAlarmDismiss}
        onSnooze={handleAlarmSnooze}
        currentAlarm={currentAlarm}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        visible={showFeedbackModal}
        onSubmit={handleFeedbackSubmit}
        onSkip={handleFeedbackSkip}
      />

      {/* API Configuration Modal */}
      {/* Alarms List */}
      <FlatList
        data={alarms}
        keyExtractor={(item) => item.id}
        renderItem={renderAlarmItem}
        contentContainerStyle={styles.alarmList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="alarm-outline" size={64} color={colors.secondary} />
            <Text style={styles.emptyText}>No alarms set</Text>
            <Text style={styles.emptySubtext}>Tap + to create your first alarm</Text>
          </View>
        }
      />

      {/* Add Alarm Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={openTimePicker}
      >
        <Ionicons name="add" size={24} color="#000" />
      </TouchableOpacity>

      {/* Test Alarm Button - Remove this in production */}
      <TouchableOpacity 
        style={[styles.fab, { bottom: 90, backgroundColor: colors.success }]} 
        onPress={() => {
          // Test alarm in 5 seconds with random preferences
          const testTime = new Date();
          testTime.setSeconds(testTime.getSeconds() + 5);
          
          // Randomly choose preferences
          const randomMediaMode = ['Mood', 'Radio', 'Calendar'][Math.floor(Math.random() * 3)] as 'Mood' | 'Radio' | 'Calendar';
          const randomMood = MOOD_OPTIONS[Math.floor(Math.random() * MOOD_OPTIONS.length)].name;
          const randomLanguage = LANGUAGE_OPTIONS[Math.floor(Math.random() * LANGUAGE_OPTIONS.length)];
          
          const testAlarm: AlarmItem = {
            id: 'test-' + Date.now(),
            time: testTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            enabled: true,
            prediction: {
              strategy: 'Test Alarm',
              media_action: `Testing ${randomMediaMode} mode with ${randomMediaMode === 'Mood' ? randomMood : randomMediaMode === 'Radio' ? 'Radio' : 'Calendar'} selection`,
              snooze_pattern: '2-5-LOUD-DISMISS',
              prediction_score: 0.9,
              wake_up_mode: randomMediaMode,
              music_type: randomMediaMode === 'Mood' ? randomMood : randomMediaMode,
              snooze_allowance: 'yes',
              message: `Testing ${randomMediaMode} mode - ${randomMediaMode === 'Mood' ? `${randomMood} mood in ${randomLanguage}` : randomMediaMode}`
            },
            snoozeCount: 0,
            initialAlarmTime: testTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            mediaMode: randomMediaMode,
            selectedMood: randomMood,
            language: randomLanguage as 'English' | 'Tamil',
            scheduledTime: testTime,
          };

          alarmService.scheduleAlarm(testAlarm.id, testTime, randomMediaMode, randomMood, false, {
            selectedLanguages: [randomLanguage]
          });
          setAlarms(prev => [...prev, testAlarm]);
          showSuccessToast('Test alarm set for 5 seconds!');
        }}
      >
        <Ionicons name="play" size={20} color="white" />
      </TouchableOpacity>

      {/* Time Picker (iOS) */}
      {Platform.OS === 'ios' && isIosPickerVisible && (
        <Modal
          transparent
          animationType="fade"
          visible={isIosPickerVisible}
          onRequestClose={cancelIosTimeSelection}
        >
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.7)'
            }}
          >
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 20,
                padding: 25,
                width: '85%',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
                elevation: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: 'bold',
                  marginBottom: 15,
                  color: '#333'
                }}
              >
                Set Alarm Time
              </Text>

              <Text
                style={{
                  fontSize: 18,
                  color: '#666',
                  marginBottom: 10,
                  textAlign: 'center'
                }}
              >
                Selected: {iosDraftTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>

              <DateTimePicker
                value={iosDraftTime}
                mode="time"
                is24Hour={false}
                display="spinner"
                onChange={handleIosTimeChange}
                style={{ width: 250, height: 180 }}
                textColor="#333"
              />

              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 25,
                  gap: 10,
                  width: '100%',
                  justifyContent: 'space-between'
                }}
              >
                <Pressable
                  onPress={cancelIosTimeSelection}
                  style={{
                    flex: 1,
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderRadius: 10,
                    backgroundColor: '#f0f0f0',
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ color: '#666', fontWeight: '600', fontSize: 16 }}>Cancel</Text>
                </Pressable>

                <Pressable
                  onPress={confirmIosTimeSelection}
                  style={{
                    flex: 1,
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderRadius: 10,
                    backgroundColor: '#4F46E5',
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>Confirm</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Alarm Setup Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={isSettingMode}
        onRequestClose={() => setIsSettingMode(false)}
      >
        <View style={modalStyles.centeredView}>
          <View style={styles.inputCard}>
            <Text style={modalStyles.modalTitle}>Set Alarm</Text>
            
            <Text style={styles.inputLabel}>
              Alarm Time: {alarmTime.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>

            <Text style={styles.inputLabel}>Planned Bedtime (HH:MM)</Text>
            <TextInput
              style={styles.textInput}
              onChangeText={setBedtimeInput}
              value={bedtimeInput}
              placeholder="23:30"
              placeholderTextColor={colors.secondary}
              keyboardType="numeric"
              maxLength={5}
            />

            <Text style={styles.inputLabel}>Wake-up Mode</Text>
            <View style={styles.modeSelector}>
              {['Mood', 'Radio', 'Calendar'].map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.modeButton,
                    mediaMode === mode && styles.modeButtonActive
                  ]}
                  onPress={() => setMediaMode(mode as 'Mood' | 'Radio' | 'Calendar')}
                >
                  <Text style={[
                    styles.modeText,
                    mediaMode === mode && styles.modeTextActive
                  ]}>
                    {mode}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {mediaMode === 'Mood' && (
              <>
                <Text style={styles.inputLabel}>Select Mood</Text>
                <View style={styles.moodSelector}>
                  {MOOD_OPTIONS.map((mood) => (
                    <TouchableOpacity
                      key={mood.name}
                      style={[
                        styles.moodButton,
                        selectedMood === mood.name && styles.modeButtonActive
                      ]}
                      onPress={() => setSelectedMood(mood.name)}
                    >
                      <Text style={[
                        styles.modeText,
                        selectedMood === mood.name && styles.modeTextActive
                      ]}>
                        {mood.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Advanced Preferences */}
                <TouchableOpacity 
                  style={styles.advancedToggle}
                  onPress={() => setShowAdvancedOptions(!showAdvancedOptions)}
                >
                  <Text style={styles.advancedToggleText}>
                    {showAdvancedOptions ? '▼ Advanced Options' : '▶ Advanced Options'}
                  </Text>
                </TouchableOpacity>

                {showAdvancedOptions && (
                  <View style={styles.advancedContainer}>
                    <Text style={styles.inputLabel}>Languages</Text>
                    <TouchableOpacity 
                      style={styles.languageSelector}
                      onPress={() => setShowLanguageModal(true)}
                    >
                      <Text style={styles.languageSelectorText}>
                        {selectedLanguages.length === 1 
                          ? selectedLanguages[0] 
                          : `${selectedLanguages.length} languages selected`}
                      </Text>
                      <Text style={styles.dropdownArrow}>▼</Text>
                    </TouchableOpacity>

                    <Text style={styles.inputLabel}>Sound Type</Text>
                    <View style={styles.modeSelector}>
                      {['Song', 'Ambient Sound'].map((type) => (
                        <TouchableOpacity
                          key={type}
                          style={[
                            styles.optionButton,
                            ambientType === type && styles.optionButtonActive
                          ]}
                          onPress={() => setAmbientType(type as any)}
                        >
                          <Text style={[
                            styles.optionText,
                            ambientType === type && styles.optionTextActive
                          ]}>
                            {type}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </>
            )}

            {mediaMode === 'Radio' && (
              <View style={styles.radioContainer}>
                <Text style={styles.inputLabel}>Radio Options</Text>
                <View style={styles.modeSelector}>
                  {['Local', 'Custom'].map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.optionButton,
                        radioOption === option && styles.optionButtonActive
                      ]}
                      onPress={() => setRadioOption(option as any)}
                    >
                      <Text style={[
                        styles.optionText,
                        radioOption === option && styles.optionTextActive
                      ]}>
                        {option === 'Local' ? '📍 Local Stations' : '🌍 Choose Station'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {radioOption === 'Custom' && (
                  <View style={styles.advancedContainer}>
                    <Text style={styles.inputLabel}>Available Radio Stations</Text>
                    <TouchableOpacity 
                      style={styles.stationSelector}
                      onPress={() => setShowRadioStations(true)}
                    >
                      <Text style={styles.stationText}>
                        {selectedRadioStation || 'Tap to choose station...'}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color={colors.onSurface} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            <View style={modalStyles.buttonRow}>
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.skipButton]}
                onPress={() => setIsSettingMode(false)}
              >
                <Text style={modalStyles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.submitButton]}
                onPress={handleCreateAlarm}
              >
                <Text style={modalStyles.buttonText}>Create Alarm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Language Selection Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={showLanguageModal}
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={modalStyles.centeredView}>
          <View style={modalStyles.modalView}>
            <Text style={modalStyles.modalTitle}>Select Languages</Text>
            <Text style={modalStyles.modalText}>
              Choose one or more languages for your music
            </Text>
            
            <View style={styles.languageList}>
              {LANGUAGE_OPTIONS.map((language) => (
                <TouchableOpacity
                  key={language}
                  style={[
                    styles.languageItem,
                    selectedLanguages.includes(language) && styles.languageItemSelected
                  ]}
                  onPress={() => {
                    if (selectedLanguages.includes(language)) {
                      // Remove language if already selected (but keep at least one)
                      if (selectedLanguages.length > 1) {
                        setSelectedLanguages(prev => prev.filter(l => l !== language));
                      }
                    } else {
                      // Add language
                      setSelectedLanguages(prev => [...prev, language]);
                    }
                  }}
                >
                  <Text style={[
                    styles.languageItemText,
                    selectedLanguages.includes(language) && styles.languageItemTextSelected
                  ]}>
                    {language}
                  </Text>
                  {selectedLanguages.includes(language) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={modalStyles.buttonRow}>
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.skipButton]}
                onPress={() => setShowLanguageModal(false)}
              >
                <Text style={modalStyles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.submitButton]}
                onPress={() => setShowLanguageModal(false)}
              >
                <Text style={modalStyles.buttonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Radio Station Selection Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={showRadioStations}
        onRequestClose={() => setShowRadioStations(false)}
      >
        <View style={modalStyles.centeredView}>
          <View style={[modalStyles.modalView, { maxHeight: '80%' }]}>
            <Text style={modalStyles.modalTitle}>Select Radio Station</Text>
            
            <FlatList
              data={availableStations}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.stationItem,
                    selectedRadioStation === item.name && styles.stationItemSelected
                  ]}
                  onPress={() => {
                    setSelectedRadioStation(item.name);
                    setShowRadioStations(false);
                  }}
                >
                  <View style={styles.stationInfo}>
                    <Text style={styles.stationName}>{item.name}</Text>
                    <Text style={styles.stationDetails}>
                      {item.genre} • {item.country}
                    </Text>
                  </View>
                  {selectedRadioStation === item.name && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                  )}
                </TouchableOpacity>
              )}
              style={{ maxHeight: 400 }}
            />
            
            <TouchableOpacity
              style={[modalStyles.button, modalStyles.skipButton]}
              onPress={() => setShowRadioStations(false)}
            >
              <Text style={modalStyles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  inputCard: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    width: '90%',
  },
  inputLabel: {
    color: colors.onSurface,
    fontSize: 14,
    marginBottom: 5,
    fontFamily: 'Quicksand-Regular',
  },
  textInput: {
    backgroundColor: colors.background,
    color: colors.onSurface,
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
    fontFamily: 'Quicksand-Regular',
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  moodSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modeButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: colors.secondary,
    alignItems: 'center',
  },
  moodButton: {
    width: '30%',
    padding: 10,
    marginHorizontal: '1.5%',
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
  },
  modeText: {
    color: colors.background,
    fontWeight: 'bold',
    fontFamily: 'Quicksand-Regular',
  },
  modeTextActive: {
    color: colors.background,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: 16,
    textAlign: 'left',
    fontFamily: 'Quicksand-Regular',
  },
  advancedToggle: {
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  advancedToggleText: {
    color: colors.secondary,
    fontSize: 14,
    fontFamily: 'Quicksand-Regular',
  },
  advancedContainer: {
    marginTop: 10,
    padding: 15,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  optionButton: {
    flex: 1,
    padding: 8,
    marginHorizontal: 2,
    borderRadius: 6,
    backgroundColor: colors.secondary,
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: colors.primary,
  },
  optionText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 11,
    fontFamily: 'Quicksand-Regular',
  },
  optionTextActive: {
    color: colors.background,
  },
  radioContainer: {
    marginTop: 10,
  },
  stationSelector: {
    backgroundColor: colors.secondary,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stationText: {
    color: colors.onSurface,
    fontSize: 14,
    fontFamily: 'Quicksand-Regular',
  },
  languageSelector: {
    backgroundColor: colors.secondary,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageSelectorText: {
    color: colors.onSurface,
    fontSize: 14,
    fontFamily: 'Quicksand-Regular',
    flex: 1,
  },
  dropdownArrow: {
    color: colors.secondary,
    fontSize: 12,
  },
  languageList: {
    maxHeight: 300,
    width: '100%',
    marginBottom: 20,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginVertical: 2,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  languageItemSelected: {
    backgroundColor: colors.primary,
  },
  languageItemText: {
    color: colors.onSurface,
    fontSize: 14,
    fontFamily: 'Quicksand-Regular',
  },
  languageItemTextSelected: {
    color: colors.background,
    fontWeight: 'bold',
  },
  checkmark: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  stationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary,
  },
  stationItemSelected: {
    backgroundColor: colors.background,
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Quicksand-Regular',
  },
  stationDetails: {
    color: colors.secondary,
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'Quicksand-Regular',
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
  alarmContent: {
    flex: 1,
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: colors.secondary,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    color: colors.secondary,
    fontSize: 14,
    marginTop: 8,
  },
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 10,
    borderRadius: 8,
    zIndex: 10,
    alignItems: 'center',
  },
  toastText: {
    color: colors.background,
    fontWeight: 'bold',
    fontFamily: 'Quicksand-Regular',
  },
  // Background Audio Control Styles
  audioControlsContainer: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#333',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  audioInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  audioTrackInfo: {
    flex: 1,
    marginRight: 10,
  },
  audioTrackName: {
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Quicksand-Regular',
  },
  audioArtistName: {
    color: colors.secondary,
    fontSize: 14,
    fontFamily: 'Quicksand-Regular',
    marginTop: 2,
  },
  audioMoodInfo: {
    color: colors.secondary,
    fontSize: 12,
    fontFamily: 'Quicksand-Regular',
    marginTop: 4,
  },
  audioControlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioControlButton: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  stopButton: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  volumeSliderContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  volumeTrack: {
    height: 4,
    backgroundColor: '#444',
    borderRadius: 2,
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
});

const ringingStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
  },
  alarmIcon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 10,
  },
  time: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.onSurface,
    marginBottom: 10,
  },
  mediaAction: {
    fontSize: 16,
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: 10,
  },
  subAction: {
    fontSize: 14,
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  buttonContainer: {
    width: '100%',
  },
  snoozeContainer: {
    marginTop: 10,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissButton: {
    backgroundColor: colors.danger,
  },
  snoozeButton: {
    backgroundColor: colors.success,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalView: {
    margin: 20,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    fontFamily: 'Quicksand-Regular',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
    color: colors.onSurface,
    fontFamily: 'Quicksand-Regular',
  },
  ratingInput: {
    backgroundColor: colors.background,
    color: colors.onSurface,
    width: 80,
    padding: 10,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 20,
    fontFamily: 'Quicksand-Regular',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: colors.secondary,
  },
  submitButton: {
    backgroundColor: colors.success,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Quicksand-Regular',
  },
  sliderContainer: {
    marginVertical: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
});