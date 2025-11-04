import { spotifyService, SpotifyTrack } from './SpotifyService';
import { radioService, RadioStation } from './RadioService';
import { textToSpeechService } from './TextToSpeechService';
import { googleCalendarService } from './GoogleCalendarService';
import { Alert } from 'react-native';

export type MediaMode = 'Mood' | 'Radio' | 'Calendar';
export type MoodType = 'Energetic' | 'Calm' | 'Neutral' | 'Dance' | 'Motivational' | 'Love';

interface MediaPlaybackResult {
  success: boolean;
  type: 'spotify' | 'radio' | 'calendar' | 'fallback';
  content?: string;
  error?: string;
}

class SmartMediaPlayerService {
  private currentPlayback: {
    type: MediaMode | null;
    content: SpotifyTrack | RadioStation | string | null;
    isPlaying: boolean;
  } = {
    type: null,
    content: null,
    isPlaying: false,
  };

  private hasSpotifyCredentials = true; // Set to true since we have hardcoded credentials
  private hasCalendarAccess = true; // Set to true since we have hardcoded credentials

  constructor() {
    // Initialize services with hardcoded credentials
    this.initializeServices();
  }

  private initializeServices() {
    // Services are already initialized with hardcoded credentials
    console.log('✅ Smart Media Player initialized with hardcoded credentials');
  }

  // Legacy methods for backward compatibility
  setSpotifyCredentials(clientId: string, clientSecret: string) {
    console.log('✅ Using hardcoded Spotify credentials');
  }

  setGoogleCalendarToken(accessToken: string, refreshToken?: string) {
    console.log('✅ Using hardcoded Google Calendar credentials');
  }

  async playAlarmMedia(
    mode: MediaMode,
    selectedMood?: MoodType,
    userPreferences?: {
      ambientType?: 'Song' | 'Ambient Sound';
      languages?: string[];
      radioStation?: RadioStation;
    }
  ): Promise<MediaPlaybackResult> {
    console.log(`🎵 Starting ${mode} alarm media...`);

    try {
      // Stop any currently playing media
      await this.stopAllMedia();

      // Announce what type of alarm is starting
      if (mode !== 'Calendar') {
        await textToSpeechService.announceAlarmType(mode, selectedMood);
        // Small delay to let announcement finish
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      switch (mode) {
        case 'Mood':
          return await this.playMoodBasedMusic(
            selectedMood || 'Energetic',
            userPreferences?.ambientType || 'Song',
            userPreferences?.languages || ['English']
          );
        
        case 'Radio':
          return await this.playRadioStation(userPreferences?.radioStation);
        
        case 'Calendar':
          return await this.playCalendarReadout();
        
        default:
          return await this.playFallbackAlarm();
      }
    } catch (error) {
      console.error('Error playing alarm media:', error);
      return await this.playFallbackAlarm();
    }
  }

  private async playMoodBasedMusic(
    mood: MoodType, 
    ambientType: 'Song' | 'Ambient Sound' = 'Song',
    languages: string[] = ['English']
  ): Promise<MediaPlaybackResult> {
    if (!this.hasSpotifyCredentials) {
      console.warn('⚠️ Spotify credentials not configured, using fallback');
      return await this.playFallbackAlarm();
    }

    try {
      console.log(`🎯 ===== SMART MEDIA PLAYER DEBUG =====`);
      console.log(`🎯 Gemini AI selecting ${mood} ${ambientType.toLowerCase()} in languages: ${languages.join(', ')}...`);
      console.log(`🎯 Calling spotifyService.selectAlarmTrack with:`);
      console.log(`   - mood: ${mood}`);
      console.log(`   - ambientType: ${ambientType}`);  
      console.log(`   - languages: [${languages.join(', ')}]`);
      console.log(`🎯 =====================================`);
      
      const selectedTrack = await spotifyService.selectAlarmTrack(mood, ambientType, languages);
      
      console.log(`🔍 ===== TRACK SELECTION RESULT =====`);
      console.log(`🎵 Selected track: ${selectedTrack ? 'SUCCESS' : 'NULL/FAILED'}`);
      if (selectedTrack) {
        console.log(`   Name: "${selectedTrack.name}"`);
        console.log(`   Artist: ${selectedTrack.artist}`);
        console.log(`   ID: ${selectedTrack.id}`);
      } else {
        console.log(`❌ NO TRACK WAS SELECTED!`);
      }
      console.log(`================================`);
      
      if (selectedTrack) {
        console.log(`🎯 ===== TRACK SELECTED, ATTEMPTING PLAYBACK =====`);
        console.log(`🎵 Selected: "${selectedTrack.name}" by ${selectedTrack.artist}`);
        console.log(`🔗 URL: ${selectedTrack.external_urls.spotify}`);
        console.log(`==============================================`);
        
        const success = await spotifyService.playTrackPreview(selectedTrack);
        console.log(`🎵 Playback result: ${success ? 'SUCCESS' : 'FAILED'}`);
        
        if (success) {
          this.currentPlayback = {
            type: 'Mood',
            content: selectedTrack,
            isPlaying: true,
          };

          // Announce the selected song
          await new Promise(resolve => setTimeout(resolve, 1000));
          await textToSpeechService.speakText(
            `Now playing: ${selectedTrack.name} by ${selectedTrack.artist}`,
            { rate: 0.8, volume: 0.7 }
          );

          return {
            success: true,
            type: 'spotify',
            content: `${selectedTrack.name} by ${selectedTrack.artist}`,
          };
        }
      }

      console.warn('⚠️ Failed to play Spotify track, using fallback');
      return await this.playFallbackAlarm();
      
    } catch (error) {
      console.error('Error playing mood-based music:', error);
      return await this.playFallbackAlarm();
    }
  }

  private async playRadioStation(preferredStation?: RadioStation): Promise<MediaPlaybackResult> {
    try {
      console.log('📻 Selecting radio station...');
      
      const station = preferredStation || await radioService.selectAlarmRadioStation();
      
      if (station) {
        const success = await radioService.playRadioStation(station);
        
        if (success) {
          this.currentPlayback = {
            type: 'Radio',
            content: station,
            isPlaying: true,
          };

          // Announce the radio station
          await new Promise(resolve => setTimeout(resolve, 2000));
          await textToSpeechService.speakText(
            `You're now listening to ${station.name}`,
            { rate: 0.8, volume: 0.7 }
          );

          return {
            success: true,
            type: 'radio',
            content: station.name,
          };
        }
      }

      console.warn('⚠️ Failed to play radio station, using fallback');
      return await this.playFallbackAlarm();
      
    } catch (error) {
      console.error('Error playing radio station:', error);
      return await this.playFallbackAlarm();
    }
  }

  private async playCalendarReadout(): Promise<MediaPlaybackResult> {
    try {
      console.log('📅 Reading calendar events...');
      
      this.currentPlayback = {
        type: 'Calendar',
        content: 'Calendar readout',
        isPlaying: true,
      };

      // Read the calendar events
      await textToSpeechService.readCalendarEvents();

      return {
        success: true,
        type: 'calendar',
        content: 'Calendar events read successfully',
      };
      
    } catch (error) {
      console.error('Error reading calendar:', error);
      return await this.playFallbackAlarm();
    }
  }

  private async playFallbackAlarm(): Promise<MediaPlaybackResult> {
    console.log('🔔 Playing fallback alarm...');
    
    try {
      await textToSpeechService.speakText(
        'Good morning! Time to wake up and start your day!',
        { rate: 0.9, pitch: 1.1 }
      );

      this.currentPlayback = {
        type: null,
        content: 'Fallback alarm',
        isPlaying: true,
      };

      return {
        success: true,
        type: 'fallback',
        content: 'Fallback voice alarm',
      };
    } catch (error) {
      console.error('Error playing fallback alarm:', error);
      return {
        success: false,
        type: 'fallback',
        error: 'Failed to play any alarm media',
      };
    }
  }

  async stopAllMedia(): Promise<void> {
    console.log('🔇 Stopping all media...');
    
    try {
      // Stop all possible audio sources
      await Promise.all([
        spotifyService.stopCurrentTrack(),
        radioService.stopRadio(),
        textToSpeechService.stopSpeaking(),
      ]);

      this.currentPlayback = {
        type: null,
        content: null,
        isPlaying: false,
      };

      console.log('✅ All media stopped');
    } catch (error) {
      console.error('Error stopping media:', error);
    }
  }

  async playUrgentAlarm(): Promise<void> {
    console.log('🚨 Playing urgent alarm...');
    
    try {
      // Stop current media
      await this.stopAllMedia();
      
      // Get next calendar event for context
      const urgentEvents = await googleCalendarService.getUrgentEvents();
      const nextEventTime = urgentEvents.length > 0 
        ? new Date(urgentEvents[0].start.dateTime || urgentEvents[0].start.date || '').toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })
        : undefined;

      // Play urgent announcement
      await textToSpeechService.announceUrgentAlarm(nextEventTime);
      
    } catch (error) {
      console.error('Error playing urgent alarm:', error);
    }
  }

  async announceSnooze(remainingSnoozes: number): Promise<void> {
    try {
      await textToSpeechService.announceSnoozeWarning(remainingSnoozes);
    } catch (error) {
      console.error('Error announcing snooze:', error);
    }
  }

  getCurrentPlayback() {
    return this.currentPlayback;
  }

  isPlaying(): boolean {
    return this.currentPlayback.isPlaying;
  }

  async testAllServices(): Promise<void> {
    console.log('🧪 Testing all media services...');
    
    Alert.alert(
      'Testing Media Services',
      'This will test text-to-speech, then attempt Spotify and Radio if configured.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Test', 
          onPress: async () => {
            // Test TTS
            await textToSpeechService.testSpeech();
            
            // Wait then test other services if available
            setTimeout(async () => {
              if (this.hasSpotifyCredentials) {
                console.log('Testing Spotify...');
                await this.playMoodBasedMusic('Energetic');
              }
            }, 3000);
          }
        }
      ]
    );
  }
}

export const smartMediaPlayerService = new SmartMediaPlayerService();