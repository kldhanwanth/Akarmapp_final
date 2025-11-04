import { Audio } from 'expo-av';

// Simple alarm sound generator
export class AlarmSoundGenerator {
  private sound: Audio.Sound | null = null;

  async createBeepSound(): Promise<Audio.Sound> {
    // Create a simple beep sound using Web Audio API data URI
    const beepSound = {
      uri: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwdBDSR2e/NeSsFJHfH8N2QQAoUXrTp66hVFA=',
    };

    const { sound } = await Audio.Sound.createAsync(beepSound);
    return sound;
  }

  async playAlarmSequence(): Promise<void> {
    try {
      // Set audio mode for alarm playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
      });

      this.sound = await this.createBeepSound();
      
      // Set to loop
      await this.sound.setIsLoopingAsync(true);
      
      // Play the sound
      await this.sound.playAsync();
      
      console.log('Alarm sound started playing');
      
    } catch (error) {
      console.error('Error playing alarm sound:', error);
      throw error;
    }
  }

  async stopAlarmSound(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
        console.log('Alarm sound stopped');
      } catch (error) {
        console.error('Error stopping alarm sound:', error);
      }
    }
  }
}

export const alarmSoundGenerator = new AlarmSoundGenerator();