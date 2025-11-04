import * as Speech from 'expo-speech';
import { googleCalendarService, CalendarEvent } from './GoogleCalendarService';

class TextToSpeechService {
  private isSpeaking = false;

  async speakText(text: string, options?: {
    voice?: string;
    pitch?: number;
    rate?: number;
    volume?: number;
  }): Promise<void> {
    try {
      if (this.isSpeaking) {
        await this.stopSpeaking();
      }

      this.isSpeaking = true;
      
      const speechOptions: Speech.SpeechOptions = {
        voice: options?.voice,
        pitch: options?.pitch || 1.0,
        rate: options?.rate || 0.75, // Slightly slower for better comprehension
        volume: options?.volume || 1.0,
        onStart: () => {
          console.log('🗣️ Started speaking');
        },
        onDone: () => {
          console.log('✅ Finished speaking');
          this.isSpeaking = false;
        },
        onStopped: () => {
          console.log('⏹️ Speech stopped');
          this.isSpeaking = false;
        },
        onError: (error) => {
          console.error('❌ Speech error:', error);
          this.isSpeaking = false;
        },
      };

      await Speech.speak(text, speechOptions);
      
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      this.isSpeaking = false;
    }
  }

  async stopSpeaking(): Promise<void> {
    try {
      await Speech.stop();
      this.isSpeaking = false;
      console.log('🔇 Speech stopped');
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  }

  async getAvailableVoices(): Promise<Speech.Voice[]> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices;
    } catch (error) {
      console.error('Error getting voices:', error);
      return [];
    }
  }

  async readCalendarEvents(): Promise<void> {
    console.log('📅 Reading today\'s calendar events...');
    
    try {
      const events = await googleCalendarService.getTodaysEvents();
      const script = googleCalendarService.generateCalendarScript(events);
      
      console.log('Calendar script:', script);
      
      // Use a pleasant, newsreader-like voice settings
      await this.speakText(script, {
        rate: 0.8, // Slightly slower for news reading style
        pitch: 1.0,
        volume: 1.0,
      });
      
    } catch (error) {
      console.error('Error reading calendar events:', error);
      
      // Fallback message
      await this.speakText(
        "Good morning! I'm unable to access your calendar at the moment, but I hope you have a wonderful day ahead!",
        { rate: 0.8, pitch: 1.0 }
      );
    }
  }

  async announceAlarmType(mediaMode: string, additionalInfo?: string): Promise<void> {
    let announcement = '';
    
    switch (mediaMode) {
      case 'Mood':
        announcement = `Good morning! I've selected a ${additionalInfo || 'personalized'} song to match your mood and wake you up gently.`;
        break;
      case 'Radio':
        announcement = `Good morning! Tuning you in to your selected radio station to start your day with live content.`;
        break;
      case 'Calendar':
        announcement = `Good morning! Let me read your schedule for today to help you plan your day.`;
        break;
      default:
        announcement = 'Good morning! Time to wake up and start your day!';
    }
    
    await this.speakText(announcement, {
      rate: 0.9,
      pitch: 1.1, // Slightly higher pitch for morning energy
      volume: 1.0,
    });
  }

  async announceUrgentAlarm(nextEventTime?: string): Promise<void> {
    let urgentMessage = 'This is your urgent wake-up call! ';
    
    if (nextEventTime) {
      urgentMessage += `You have an important event coming up at ${nextEventTime}. `;
    }
    
    urgentMessage += 'Time to get up now!';
    
    await this.speakText(urgentMessage, {
      rate: 1.0, // Normal speed for urgency
      pitch: 1.2, // Higher pitch for alertness
      volume: 1.0,
    });
  }

  async announceSnoozeWarning(remainingSnoozes: number): Promise<void> {
    let message = '';
    
    if (remainingSnoozes <= 1) {
      message = 'This is your final snooze. Time to wake up!';
    } else if (remainingSnoozes <= 2) {
      message = `You have ${remainingSnoozes} snoozes remaining. Consider getting up soon.`;
    } else {
      message = `Snooze activated. ${remainingSnoozes} snoozes remaining.`;
    }
    
    await this.speakText(message, {
      rate: 0.9,
      pitch: 1.0,
      volume: 0.8, // Slightly quieter for snooze
    });
  }

  isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  async testSpeech(): Promise<void> {
    await this.speakText(
      'Hello! This is a test of the alarm speech system. If you can hear this clearly, everything is working perfectly!',
      { rate: 0.8, pitch: 1.0 }
    );
  }
}

export const textToSpeechService = new TextToSpeechService();