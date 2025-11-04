// 🎵 INTELLIGENT BACKGROUND AUDIO SERVICE
// Plays alarm music in background with smart controls

import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import { spotifyService } from './SpotifyService';
import { RealTimeLearningSystem } from '../intelligence/RealTimeLearningSystem';

export interface AlarmAudioOptions {
  mood: string;
  languages: string[];
  volume?: number;
  fadeInDuration?: number;
  maxDuration?: number; // Auto-stop after this time (minutes)
}

export interface AudioPlaybackState {
  isPlaying: boolean;
  currentTrack: any | null;
  volume: number;
  position: number;
  duration: number;
  mood: string;
  language: string;
}

class BackgroundAudioServiceClass {
  private sound: Audio.Sound | null = null;
  private currentTrack: any | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.7;
  private fadeInTimer: number | null = null;
  private autoStopTimer: number | null = null;
  private currentMood: string = '';
  private currentLanguage: string = '';

  constructor() {
    this.initializeAudio();
  }

  // 🎵 INITIALIZE AUDIO SYSTEM
  private async initializeAudio(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });
      console.log('🎵 Background audio system initialized');
    } catch (error) {
      console.error('❌ Failed to initialize audio:', error);
    }
  }

  // 🚀 START INTELLIGENT ALARM WITH BACKGROUND AUDIO
  async startAlarm(options: AlarmAudioOptions): Promise<boolean> {
    try {
      console.log('🚀 ===== STARTING INTELLIGENT ALARM AUDIO =====');
      console.log(`🎯 Target: ${options.mood} in ${options.languages.join(', ')}`);
      
      // Stop any existing alarm
      await this.stopAlarm();
      
      // Get intelligent track selection
      const selectedTrack = await spotifyService.getIntelligentTrack(
        options.mood,
        options.languages
      );
      
      if (!selectedTrack) {
        console.error('❌ No track selected by intelligence system');
        return false;
      }

      if (!selectedTrack.preview_url) {
        console.error('❌ No preview URL available for track');
        // Fallback to Spotify app launching
        return this.fallbackToSpotifyApp(selectedTrack, options);
      }

      this.currentTrack = selectedTrack;
      this.currentMood = options.mood;
      this.currentLanguage = options.languages[0] || 'Tamil';
      
      console.log(`🎵 Loading: "${selectedTrack.name}" by ${selectedTrack.artist}`);
      
      // Load and play audio with expo-av
      const { sound } = await Audio.Sound.createAsync(
        { uri: selectedTrack.preview_url },
        {
          shouldPlay: true,
          isLooping: true,
          volume: options.volume || 0.7, // Start with desired volume
        }
      );
      
      this.sound = sound;
      this.isPlaying = true;
      this.volume = options.volume || 0.7;
      
      // Fade in effect if requested
      if (options.fadeInDuration && options.fadeInDuration > 0) {
        await this.sound.setVolumeAsync(0); // Start silent
        await this.fadeIn(options.fadeInDuration, this.volume);
      }
      
      // Setup auto-stop timer
      if (options.maxDuration) {
        this.autoStopTimer = window.setTimeout(() => {
          this.stopAlarm();
          console.log(`⏰ Auto-stopped after ${options.maxDuration} minutes`);
        }, options.maxDuration * 60 * 1000);
      }
      
      // Record user interaction for learning
      await RealTimeLearningSystem.recordInteraction({
        timestamp: Date.now(),
        action: 'play',
        track: {
          id: selectedTrack.id,
          name: selectedTrack.name,
          artist: selectedTrack.artist,
          language: this.currentLanguage as 'Tamil' | 'English',
        },
        context: {
          mood: options.mood,
          timeOfDay: this.getTimeOfDay(),
          dayOfWeek: new Date().toLocaleDateString('en', { weekday: 'long' }).toLowerCase(),
          selectedLanguages: options.languages,
        },
      });
      
      console.log('✅ Background alarm audio started successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to start alarm audio:', error);
      return false;
    }
  }

  // 📱 FALLBACK TO SPOTIFY APP
  private async fallbackToSpotifyApp(track: any, options: AlarmAudioOptions): Promise<boolean> {
    try {
      console.log('📱 Falling back to Spotify app...');
      
      // Open Spotify with the track
      const success = await spotifyService.playTrack(track);
      
      if (success) {
        this.currentTrack = track;
        this.currentMood = options.mood;
        this.currentLanguage = options.languages[0] || 'Tamil';
        this.isPlaying = true;
        
        // Record interaction
        await RealTimeLearningSystem.recordInteraction({
          timestamp: Date.now(),
          action: 'play',
          track: {
            id: track.id,
            name: track.name,
            artist: track.artist,
            language: this.currentLanguage as 'Tamil' | 'English',
          },
          context: {
            mood: options.mood,
            timeOfDay: this.getTimeOfDay(),
            dayOfWeek: new Date().toLocaleDateString('en', { weekday: 'long' }).toLowerCase(),
            selectedLanguages: options.languages,
          },
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Spotify fallback failed:', error);
      return false;
    }
  }

  // ⏰ GET TIME OF DAY
  private getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  // 🌅 FADE IN EFFECT
  private async fadeIn(durationMs: number, targetVolume: number): Promise<void> {
    const steps = 20;
    const stepDuration = durationMs / steps;
    const volumeStep = targetVolume / steps;
    
    for (let i = 1; i <= steps; i++) {
      const currentVolume = volumeStep * i;
      if (this.sound) {
        await this.sound.setVolumeAsync(currentVolume);
        this.volume = currentVolume;
      }
      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }
  }

  // 🔕 STOP ALARM
  async stopAlarm(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
      }
      
      if (this.fadeInTimer) {
        clearTimeout(this.fadeInTimer);
        this.fadeInTimer = null;
      }
      
      if (this.autoStopTimer) {
        clearTimeout(this.autoStopTimer);
        this.autoStopTimer = null;
      }
      
      if (this.isPlaying && this.currentTrack) {
        // Record stop interaction for learning
        await RealTimeLearningSystem.recordInteraction({
          timestamp: Date.now(),
          action: 'skip',
          track: {
            id: this.currentTrack.id,
            name: this.currentTrack.name,
            artist: this.currentTrack.artist,
            language: this.currentLanguage as 'Tamil' | 'English',
          },
          context: {
            mood: this.currentMood,
            timeOfDay: this.getTimeOfDay(),
            dayOfWeek: new Date().toLocaleDateString('en', { weekday: 'long' }).toLowerCase(),
            selectedLanguages: [this.currentLanguage],
          },
        });
      }
      
      this.isPlaying = false;
      this.currentTrack = null;
      this.currentMood = '';
      this.currentLanguage = '';
      
      console.log('🔕 Alarm stopped');
    } catch (error) {
      console.error('❌ Failed to stop alarm:', error);
    }
  }

  // 😴 SNOOZE ALARM (5 minutes)
  async snoozeAlarm(snoozeMinutes: number = 5): Promise<void> {
    try {
      if (!this.isPlaying) return;
      
      // Record snooze for learning
      if (this.currentTrack) {
        await RealTimeLearningSystem.recordInteraction({
          timestamp: Date.now(),
          action: 'skip',
          track: {
            id: this.currentTrack.id,
            name: this.currentTrack.name,
            artist: this.currentTrack.artist,
            language: this.currentLanguage as 'Tamil' | 'English',
          },
          context: {
            mood: this.currentMood,
            timeOfDay: this.getTimeOfDay(),
            dayOfWeek: new Date().toLocaleDateString('en', { weekday: 'long' }).toLowerCase(),
            selectedLanguages: [this.currentLanguage],
          },
        });
      }
      
      // Stop current alarm
      await this.stopAlarm();
      
      // Schedule restart
      setTimeout(async () => {
        console.log('😴 Snooze ended, restarting alarm...');
        // Restart with same settings
        await this.startAlarm({
          mood: this.currentMood,
          languages: [this.currentLanguage],
          volume: this.volume,
          fadeInDuration: 2000,
        });
      }, snoozeMinutes * 60 * 1000);
      
    } catch (error) {
      console.error('❌ Failed to snooze alarm:', error);
    }
  }

  // 📊 GET CURRENT PLAYBACK STATE
  getPlaybackState(): AudioPlaybackState {
    return {
      isPlaying: this.isPlaying,
      currentTrack: this.currentTrack,
      volume: this.volume,
      position: 0, // Would need position tracking for this
      duration: 0, // Would need duration tracking for this
      mood: this.currentMood,
      language: this.currentLanguage,
    };
  }

  // 🔊 ADJUST VOLUME
  async setVolume(volume: number): Promise<void> {
    try {
      volume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
      
      if (this.sound) {
        await this.sound.setVolumeAsync(volume);
      }
      
      this.volume = volume;
      console.log(`🔊 Volume set to ${Math.round(volume * 100)}%`);
    } catch (error) {
      console.error('❌ Failed to set volume:', error);
    }
  }

  // 🎵 GET NEXT INTELLIGENT TRACK (for variety)
  async getNextTrack(): Promise<void> {
    try {
      if (!this.isPlaying) return;
      
      const currentOptions = {
        mood: this.currentMood,
        languages: [this.currentLanguage],
        volume: this.volume,
      };
      
      // Stop current and start new
      await this.stopAlarm();
      await this.startAlarm(currentOptions);
      
      console.log('🔄 Switched to next intelligent track');
    } catch (error) {
      console.error('❌ Failed to get next track:', error);
    }
  }
}

// Export singleton instance
export const BackgroundAudioService = new BackgroundAudioServiceClass();