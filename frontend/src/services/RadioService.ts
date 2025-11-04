import { Audio } from 'expo-av';

export interface RadioStation {
  id: string;
  name: string;
  url: string;
  country: string;
  genre: string;
  homepage?: string;
  favicon?: string;
  language?: string;
}

class RadioService {
  private currentSound: Audio.Sound | null = null;
  private isPlaying = false;

  // Popular international radio stations
  private defaultStations: RadioStation[] = [
    {
      id: 'bbc-radio1',
      name: 'BBC Radio 1',
      url: 'http://stream.live.vc.bbcmedia.co.uk/bbc_radio_one',
      country: 'UK',
      genre: 'Pop/Rock',
      language: 'English'
    },
    {
      id: 'heart-london',
      name: 'Heart London',
      url: 'http://media-ssl.musicradio.com/HeartLondon',
      country: 'UK',
      genre: 'Pop',
      language: 'English'
    },
    {
      id: 'npr-news',
      name: 'NPR News',
      url: 'https://npr-ice.streamguys1.com/live.mp3',
      country: 'US',
      genre: 'News/Talk',
      language: 'English'
    },
    {
      id: 'classical-fm',
      name: 'Classic FM',
      url: 'http://media-ssl.musicradio.com/ClassicFM',
      country: 'UK',
      genre: 'Classical',
      language: 'English'
    },
    {
      id: 'jazz-fm',
      name: 'Jazz FM',
      url: 'http://edge-bauermz-01-gos2.sharp-stream.com/jazzhigh.aac',
      country: 'UK',
      genre: 'Jazz',
      language: 'English'
    },
    {
      id: 'smooth-radio',
      name: 'Smooth Radio',
      url: 'http://media-ssl.musicradio.com/SmoothUK',
      country: 'UK',
      genre: 'Easy Listening',
      language: 'English'
    }
  ];

  async searchRadioStations(query: string): Promise<RadioStation[]> {
    try {
      // Using radio-browser.info API - free radio station database
      const response = await fetch(
        `https://de1.api.radio-browser.info/json/stations/search?name=${encodeURIComponent(query)}&limit=20&order=clickcount&reverse=true`,
        {
          headers: {
            'User-Agent': 'AkarmApp/1.0',
          },
        }
      );

      const stations = await response.json();
      
      return stations.map((station: any) => ({
        id: station.stationuuid,
        name: station.name,
        url: station.url_resolved || station.url,
        country: station.country,
        genre: station.tags || 'Various',
        homepage: station.homepage,
        favicon: station.favicon,
        language: station.language
      }));
    } catch (error) {
      console.error('Error searching radio stations:', error);
      return this.defaultStations;
    }
  }

  async getStationsByCountry(country: string): Promise<RadioStation[]> {
    try {
      const response = await fetch(
        `https://de1.api.radio-browser.info/json/stations/bycountry/${encodeURIComponent(country)}?limit=50&order=clickcount&reverse=true`,
        {
          headers: {
            'User-Agent': 'AkarmApp/1.0',
          },
        }
      );

      const stations = await response.json();
      
      return stations.map((station: any) => ({
        id: station.stationuuid,
        name: station.name,
        url: station.url_resolved || station.url,
        country: station.country,
        genre: station.tags || 'Various',
        homepage: station.homepage,
        favicon: station.favicon,
        language: station.language
      }));
    } catch (error) {
      console.error('Error getting stations by country:', error);
      return this.getLocalStations();
    }
  }

  getLocalStations(): RadioStation[] {
    // Simulate local radio stations based on user location
    // In a real app, this would use geolocation and a radio API
    return [
      {
        id: 'local-pop',
        name: 'Local Pop FM 101.5',
        url: 'http://stream.live.vc.bbcmedia.co.uk/bbc_radio_one',
        country: 'Local',
        genre: 'Pop',
        language: 'English'
      },
      {
        id: 'local-rock',
        name: 'Rock City 98.7',
        url: 'http://media-ssl.musicradio.com/HeartLondon',
        country: 'Local',
        genre: 'Rock',
        language: 'English'
      },
      {
        id: 'local-news',
        name: 'Local News Radio AM 1010',
        url: 'http://playerservices.streamtheworld.com/api/livestream-redirect/TLPSTR01.mp3',
        country: 'Local',
        genre: 'News/Talk',
        language: 'English'
      },
      {
        id: 'local-classical',
        name: 'Classical FM 104.3',
        url: 'http://radio.canstream.co.uk:8007/live.mp3',
        country: 'Local',
        genre: 'Classical',
        language: 'English'
      }
    ];
  }

  // Get all available international stations for user selection
  getAvailableStations(): RadioStation[] {
    return this.defaultStations;
  }

  async playRadioStation(station: RadioStation): Promise<boolean> {
    try {
      // Stop any currently playing audio
      await this.stopRadio();

      console.log(`📻 Tuning to: ${station.name} (${station.country})`);

      // Set audio mode for radio playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: station.url },
        { 
          shouldPlay: true,
          isLooping: false, // Radio streams don't need looping
          volume: 1.0
        }
      );

      this.currentSound = sound;
      this.isPlaying = true;
      
      // Handle stream loading errors
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded && status.error) {
          console.error('Radio stream error:', status.error);
          this.stopRadio();
        }
      });

      console.log(`🎵 Now playing: ${station.name}`);
      return true;
      
    } catch (error) {
      console.error('Error playing radio station:', error);
      return false;
    }
  }

  async stopRadio(): Promise<void> {
    if (this.currentSound) {
      try {
        await this.currentSound.stopAsync();
        await this.currentSound.unloadAsync();
        this.currentSound = null;
        this.isPlaying = false;
        console.log('📻 Radio stopped');
      } catch (error) {
        console.error('Error stopping radio:', error);
      }
    }
  }

  async selectAlarmRadioStation(): Promise<RadioStation | null> {
    console.log('🤖 Gemini selecting radio station for alarm...');
    
    try {
      // Get a variety of stations
      const stations = this.getLocalStations();
      
      if (stations.length === 0) {
        return null;
      }

      // Intelligent selection based on time of day and typical radio preferences
      const currentHour = new Date().getHours();
      let preferredGenres: string[] = [];
      
      if (currentHour >= 6 && currentHour < 10) {
        // Morning: News, Talk, Upbeat music
        preferredGenres = ['News', 'Talk', 'Pop'];
      } else if (currentHour >= 10 && currentHour < 14) {
        // Mid-morning: Music, Easy listening
        preferredGenres = ['Pop', 'Easy Listening', 'Jazz'];
      } else if (currentHour >= 14 && currentHour < 18) {
        // Afternoon: Various music
        preferredGenres = ['Rock', 'Pop', 'Jazz'];
      } else {
        // Evening/Night: Calm, easy listening
        preferredGenres = ['Classical', 'Jazz', 'Easy Listening'];
      }

      // Find stations matching preferred genres
      const matchingStations = stations.filter(station => 
        preferredGenres.some(genre => 
          station.genre.toLowerCase().includes(genre.toLowerCase())
        )
      );

      const finalStations = matchingStations.length > 0 ? matchingStations : stations;
      const selectedStation = finalStations[Math.floor(Math.random() * finalStations.length)];
      
      console.log(`🎯 Gemini selected: ${selectedStation.name} (${selectedStation.genre})`);
      return selectedStation;
      
    } catch (error) {
      console.error('Error selecting radio station:', error);
      return null;
    }
  }

  isRadioPlaying(): boolean {
    return this.isPlaying;
  }

  getCurrentStation(): RadioStation | null {
    // In a full implementation, you'd track the current station
    return null;
  }
}

export const radioService = new RadioService();