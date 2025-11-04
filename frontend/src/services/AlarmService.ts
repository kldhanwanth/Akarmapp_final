import { Audio } from 'expo-av';
import { Alert, Vibration } from 'react-native';
import { smartMediaPlayerService, MediaMode, MoodType } from './SmartMediaPlayerService';
import { googleCalendarService } from './GoogleCalendarService';

export interface AlarmSound {
  id: string;
  name: string;
  uri: string;
}

export interface AlarmData {
  id: string;
  mediaMode?: MediaMode;
  selectedMood?: MoodType;
  isUrgent?: boolean;
  scheduledTime?: Date;
  // New advanced preferences
  ambientType?: 'Song' | 'Ambient Sound';
  selectedLanguages?: string[];
  radioOption?: 'Local' | 'Custom';
  selectedRadioStation?: string;
}

// Built-in alarm sounds (using default system sounds)
export const ALARM_SOUNDS: AlarmSound[] = [
  { id: 'default', name: 'Default Alarm', uri: 'default' },
  { id: 'beep', name: 'Beep', uri: 'beep' },
  { id: 'bell', name: 'Bell', uri: 'bell' },
  { id: 'chime', name: 'Chime', uri: 'chime' },
];

class AlarmService {
  private activeSound: Audio.Sound | null = null;
  private alarmTimers: Map<string, number> = new Map();
  private alarmData: Map<string, AlarmData> = new Map(); // Store alarm preferences
  private isRinging = false;
  private ringCallback: ((alarmId: string) => void) | null = null;
  private currentAlarmId: string | null = null;

  constructor() {
    this.initializeAudio();
  }

  private async initializeAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
      });
    } catch (error) {
      console.warn('Failed to initialize audio:', error);
    }
  }

  setAlarmCallback(callback: (alarmId: string) => void) {
    this.ringCallback = callback;
  }

  async scheduleAlarm(
    alarmId: string, 
    alarmTime: Date, 
    mediaMode?: MediaMode, 
    selectedMood?: MoodType,
    isUrgent?: boolean,
    preferences?: {
      ambientType?: 'Song' | 'Ambient Sound';
      selectedLanguages?: string[];
      radioOption?: 'Local' | 'Custom';
      selectedRadioStation?: string;
    }
  ): Promise<void> {
    // Clear any existing timer for this alarm
    this.clearAlarm(alarmId);

    const now = new Date();
    let triggerTime = new Date(alarmTime);
    
    // If the alarm time is in the past, schedule for tomorrow
    if (triggerTime.getTime() <= now.getTime()) {
      triggerTime.setDate(triggerTime.getDate() + 1);
    }

    // Store alarm data including preferences
    const alarmData: AlarmData = {
      id: alarmId,
      mediaMode,
      selectedMood,
      isUrgent,
      scheduledTime: triggerTime,
      ambientType: preferences?.ambientType || 'Song',
      selectedLanguages: preferences?.selectedLanguages || ['English'],
      radioOption: preferences?.radioOption || 'Local',
      selectedRadioStation: preferences?.selectedRadioStation || '',
    };
    this.alarmData.set(alarmId, alarmData);

    const timeUntilAlarm = triggerTime.getTime() - now.getTime();

    console.log(`Scheduling alarm ${alarmId} for ${triggerTime.toLocaleString()}`);
    console.log(`📱 Storing Media mode: ${mediaMode}, Mood: ${selectedMood}`);
    console.log(`📱 Advanced preferences: ${preferences?.ambientType || 'Song'}, Languages: ${preferences?.selectedLanguages?.join(', ') || 'English'}`);
    console.log(`Time until alarm: ${Math.round(timeUntilAlarm / 1000 / 60)} minutes`);

    const timer = setTimeout(() => {
      this.triggerAlarm(alarmId);
    }, timeUntilAlarm) as unknown as number;

    this.alarmTimers.set(alarmId, timer);
  }

  clearAlarm(alarmId: string): void {
    const timer = this.alarmTimers.get(alarmId);
    if (timer) {
      clearTimeout(timer);
      this.alarmTimers.delete(alarmId);
      console.log(`Cleared alarm ${alarmId}`);
    }
    
    // Also remove stored alarm data
    this.alarmData.delete(alarmId);
  }

  async triggerAlarm(alarmId: string): Promise<void> {
    if (this.isRinging) {
      console.log('Another alarm is already ringing');
      return;
    }

    // Retrieve stored alarm data
    const alarmData = this.alarmData.get(alarmId);
    const mediaMode = alarmData?.mediaMode;
    const selectedMood = alarmData?.selectedMood;
    const isUrgent = alarmData?.isUrgent || false;

    console.log(`🚨 Triggering ${isUrgent ? 'URGENT ' : ''}alarm ${alarmId}`);
    console.log(`📱 Retrieved Media Mode: ${mediaMode}, Mood: ${selectedMood}`);
    console.log(`🗂️ Alarm data:`, alarmData);
    
    this.isRinging = true;
    this.currentAlarmId = alarmId;
    
    try {
      if (isUrgent) {
        // For urgent alarms, play loud alarm + urgent announcement
        await this.playAlarmSound();
        await smartMediaPlayerService.playUrgentAlarm();
      } else if (mediaMode) {
        // Play user's selected media mode
        console.log(`🎵 Playing ${mediaMode} alarm with mood: ${selectedMood}`);
        const userPreferences = {
          ambientType: alarmData.ambientType,
          languages: alarmData.selectedLanguages,
          radioStation: alarmData.selectedRadioStation ? { 
            id: alarmData.selectedRadioStation, 
            name: alarmData.selectedRadioStation,
            url: '', 
            country: '', 
            genre: '' 
          } : undefined,
        };
        const result = await smartMediaPlayerService.playAlarmMedia(mediaMode, selectedMood, userPreferences);
        
        if (!result.success) {
          console.warn('Media playback failed, falling back to alarm sound');
          await this.playAlarmSound();
        }
      } else {
        // Default alarm sound
        await this.playAlarmSound();
      }
      
      // Start vibration pattern
      this.startVibration();
      
      // Notify the UI
      if (this.ringCallback) {
        this.ringCallback(alarmId);
      }
      
    } catch (error) {
      console.error('Error triggering alarm:', error);
      this.isRinging = false;
      this.currentAlarmId = null;
    }
  }

  private async playAlarmSound(): Promise<void> {
    try {
      // Stop any currently playing sound
      await this.stopAlarmSound();

      // Create a repeating beep sound programmatically
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFA==' },
        { shouldPlay: false }
      );

      this.activeSound = sound;
      
      // Play the sound in a loop
      await sound.setIsLoopingAsync(true);
      await sound.playAsync();
      
    } catch (error) {
      console.error('Error playing alarm sound:', error);
      // Fallback: use system alert
      Alert.alert('🚨 ALARM!', 'Wake up!', [
        { text: 'Snooze', onPress: () => {} },
        { text: 'Dismiss', onPress: () => this.stopAlarm() }
      ]);
    }
  }

  private startVibration(): void {
    // Vibration pattern: [wait, vibrate, wait, vibrate, ...]
    const pattern = [0, 1000, 1000, 1000, 1000, 1000];
    Vibration.vibrate(pattern, true); // true = repeat
  }

  async stopAlarm(): Promise<void> {
    console.log('🛑 Stopping alarm');
    this.isRinging = false;
    this.currentAlarmId = null;
    
    // Stop vibration
    Vibration.cancel();
    
    // Stop all media (Spotify, Radio, TTS, and alarm sound)
    await Promise.all([
      this.stopAlarmSound(),
      smartMediaPlayerService.stopAllMedia(),
    ]);
  }

  private async stopAlarmSound(): Promise<void> {
    if (this.activeSound) {
      try {
        await this.activeSound.stopAsync();
        await this.activeSound.unloadAsync();
      } catch (error) {
        console.warn('Error stopping sound:', error);
      }
      this.activeSound = null;
    }
  }

  async snoozeAlarm(alarmId: string, snoozeMinutes: number): Promise<void> {
    await this.stopAlarm();
    
    const snoozeTime = new Date();
    snoozeTime.setMinutes(snoozeTime.getMinutes() + snoozeMinutes);
    
    console.log(`😴 Snoozing alarm ${alarmId} for ${snoozeMinutes} minutes`);
    
    // Announce snooze (optional - can be disabled if too verbose)
    // await smartMediaPlayerService.announceSnooze(snoozeMinutes);
    
    await this.scheduleAlarm(alarmId, snoozeTime);
  }

  async scheduleUrgentAlarm(alarmId: string, urgentTime: Date): Promise<void> {
    // Schedule an urgent alarm (for calendar-based wake-up)
    const now = new Date();
    const timeUntilUrgent = urgentTime.getTime() - now.getTime();

    if (timeUntilUrgent > 0) {
      console.log(`🚨 Scheduling URGENT alarm ${alarmId} for ${urgentTime.toLocaleString()}`);
      
      const timer = setTimeout(async () => {
        // Update the alarm data to mark it as urgent
        const existingData = this.alarmData.get(alarmId);
        if (existingData) {
          existingData.isUrgent = true;
          this.alarmData.set(alarmId, existingData);
        }
        await this.triggerAlarm(alarmId);
      }, timeUntilUrgent) as unknown as number;

      this.alarmTimers.set(`${alarmId}-urgent`, timer);
    }
  }

  async checkForCalendarConflicts(alarmTime: Date): Promise<Date | null> {
    // Check if there are urgent calendar events that require earlier wake-up
    try {
      const urgentEvents = await googleCalendarService.getUrgentEvents();
      
      if (urgentEvents.length > 0) {
        const firstEvent = urgentEvents[0];
        const eventTime = new Date(firstEvent.start.dateTime || firstEvent.start.date || '');
        
        // If there's an event within 30 minutes of alarm time, suggest earlier wake-up
        const timeDiff = eventTime.getTime() - alarmTime.getTime();
        const thirtyMinutes = 30 * 60 * 1000;
        
        if (timeDiff > 0 && timeDiff < thirtyMinutes) {
          const suggestedTime = new Date(eventTime.getTime() - thirtyMinutes);
          console.log(`📅 Calendar conflict detected. Suggesting wake-up at ${suggestedTime.toLocaleString()}`);
          return suggestedTime;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error checking calendar conflicts:', error);
      return null;
    }
  }

  getScheduledAlarms(): string[] {
    return Array.from(this.alarmTimers.keys());
  }

  clearAllAlarms(): void {
    this.alarmTimers.forEach((timer, alarmId) => {
      clearTimeout(timer);
      console.log(`Cleared alarm ${alarmId}`);
    });
    this.alarmTimers.clear();
  }

  isAlarmRinging(): boolean {
    return this.isRinging;
  }
}

export const alarmService = new AlarmService();