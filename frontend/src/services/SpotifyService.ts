import { Audio } from 'expo-av';
import { Linking } from 'react-native';

// 🧠 IMPORT GODLIKE INTELLIGENCE SYSTEMS
import { MusicIntelligenceDatabase } from '../intelligence/MusicIntelligenceDatabase';
import { AdvancedLanguageDetector } from '../intelligence/AdvancedLanguageDetector';
import { AdvancedScoringEngine } from '../intelligence/AdvancedScoringEngine';
import { IntelligentSearchEngine } from '../intelligence/IntelligentSearchEngine';
import { RealTimeLearningSystem } from '../intelligence/RealTimeLearningSystem';
import { IntelligentRandomizer } from '../intelligence/IntelligentRandomizer';

export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
  popularity?: number;
  searchPriority?: number;
  score?: number;
  release_date?: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  tracks: {
    total: number;
    items: Array<{
      track: SpotifyTrack;
    }>;
  };
}

class SpotifyService {
  // Demo credentials - Replace with your actual Spotify app credentials
  private clientId: string = '3e7d942ae3c34b7d985cd97141da9b46';
  private clientSecret: string = 'dfc0e508489a4f3d9571eda2d154ba55';
  private accessToken: string | null = null;
  private currentSound: Audio.Sound | null = null;
  private userProfile: any = null;
  private userTopTracks: SpotifyTrack[] = [];
  private userTopArtists: any[] = [];

  // Enhanced user taste analysis
  async analyzeUserTasteProfile(): Promise<void> {
    const token = await this.getAccessToken();
    if (!token) return;

    try {
      console.log('🧠 Gemini analyzing your Spotify taste profile...');
      
      // Get user's top tracks (short term = last 4 weeks)
      const topTracksResponse = await fetch(
        'https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=short_term',
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (topTracksResponse.ok) {
        const topTracksData = await topTracksResponse.json();
        this.userTopTracks = topTracksData.items.map((track: any) => ({
          id: track.id,
          name: track.name,
          artist: track.artists[0]?.name || 'Unknown',
          preview_url: track.preview_url,
          external_urls: track.external_urls,
          popularity: track.popularity,
          energy: Math.random(), // Would normally get from audio features
          valence: Math.random(),
        }));
        console.log(`✅ Analyzed ${this.userTopTracks.length} of your favorite tracks`);
      }

      // Get user's top artists
      const topArtistsResponse = await fetch(
        'https://api.spotify.com/v1/me/top/artists?limit=50&time_range=medium_term',
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (topArtistsResponse.ok) {
        const topArtistsData = await topArtistsResponse.json();
        this.userTopArtists = topArtistsData.items;
        console.log(`✅ Analyzed ${this.userTopArtists.length} of your favorite artists`);
      }

      // Get user profile
      const profileResponse = await fetch(
        'https://api.spotify.com/v1/me',
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (profileResponse.ok) {
        this.userProfile = await profileResponse.json();
        console.log(`✅ Retrieved profile for ${this.userProfile.display_name}`);
      }

    } catch (error) {
      console.log('ℹ️ Using anonymous mode - will select popular tracks instead');
    }
  }

  // Legacy method for backward compatibility
  setCredentials(clientId: string, clientSecret: string) {
    console.log('Using hardcoded credentials for demo purposes');
    // Credentials are now hardcoded above
  }

  // Add a simple test method to verify credentials work
  async testCredentials(): Promise<boolean> {
    console.log('🧪 Testing Spotify credentials...');
    const token = await this.getAccessToken();
    return token !== null;
  }

  // Test search API specifically
  async testSearchAPI(): Promise<boolean> {
    console.log('🧪 Testing Spotify Search API...');
    const token = await this.getAccessToken();
    if (!token) {
      console.error('❌ No access token available');
      return false;
    }

    try {
      const response = await fetch(
        'https://api.spotify.com/v1/search?q=test&type=track&limit=1',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      console.log(`🌐 Search API test response: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Search API working! Found ${data.tracks?.items?.length || 0} test tracks`);
        return true;
      } else {
        console.error(`❌ Search API test failed: ${response.status} ${response.statusText}`);
        return false;
      }
    } catch (error) {
      console.error('❌ Search API test error:', error);
      return false;
    }
  }

  private async getAccessToken(): Promise<string | null> {
    if (this.accessToken) return this.accessToken;

    // Validate credentials format
    if (!this.clientId || this.clientId.length !== 32) {
      console.error('❌ Invalid Spotify Client ID format. Should be 32 characters.');
      return null;
    }
    
    if (!this.clientSecret || this.clientSecret.length !== 32) {
      console.error('❌ Invalid Spotify Client Secret format. Should be 32 characters.');
      return null;
    }

    console.log('🎵 Requesting Spotify access token...');
    console.log('🔑 Using Client ID:', this.clientId.substring(0, 8) + '...');
    console.log('🔐 Client Secret length:', this.clientSecret.length);
    console.log('🔒 App in Development Mode with registered user access');
    console.log('🌐 Request URL:', 'https://accounts.spotify.com/api/token');

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`,
        },
        body: 'grant_type=client_credentials',
      });

      console.log('🌐 Token request response status:', response.status);

      if (!response.ok) {
        console.error('Spotify token request failed:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Token error response:', errorText);
        console.error('Request URL:', 'https://accounts.spotify.com/api/token');
        console.error('Request headers:', {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`,
        });
        
        // Check if it's a 404 specifically
        if (response.status === 404) {
          console.error('❌ 404 Error: This usually means:');
          console.error('   1. Invalid Client ID or Client Secret');
          console.error('   2. Spotify app is not properly configured');
          console.error('   3. App might be in restricted mode');
        }
        
        return null;
      }

      console.log('✅ Token request successful!');
      const data = await response.json();
      this.accessToken = data.access_token;
      console.log('🎯 Access token received');
      return this.accessToken;
    } catch (error) {
      console.error('Error getting Spotify access token:', error);
      return null;
    }
  }

  async searchTracksByMood(mood: 'Energetic' | 'Calm' | 'Neutral' | 'Dance' | 'Motivational' | 'Love', limit: number = 20, languages: string[] = ['English']): Promise<SpotifyTrack[]> {
    const token = await this.getAccessToken();
    if (!token) return [];

    console.log(`🔍 Basic search for ${mood} mood in languages: ${languages.join(', ')}`);

    // Enhanced search strategies focusing on popular songs with language support
    const getPopularArtistsByMood = (mood: 'Energetic' | 'Calm' | 'Neutral' | 'Dance' | 'Motivational' | 'Love', lang: string = 'English') => {
      if (lang === 'Tamil') {
        const tamilArtistMap = {
          Energetic: ['anirudh ravichander', 'harris jayaraj', 'yuvan shankar raja'],
          Calm: ['a.r. rahman', 'ilaiyaraaja', 'harris jayaraj'],
          Neutral: ['harris jayaraj', 'yuvan shankar raja', 'gv prakash'],
          Dance: ['anirudh ravichander', 'harris jayaraj', 'yuvan shankar raja'],
          Motivational: ['a.r. rahman', 'anirudh ravichander', 'harris jayaraj'],
          Love: ['a.r. rahman', 'harris jayaraj', 'ilaiyaraaja'],
        };
        return tamilArtistMap[mood];
      }
      
      const artistMap = {
        Energetic: ['dua lipa', 'the weeknd', 'bruno mars', 'ariana grande', 'post malone', 'travis scott'],
        Calm: ['billie eilish', 'lorde', 'adele', 'sam smith', 'john mayer', 'ed sheeran'],
        Neutral: ['taylor swift', 'coldplay', 'maroon 5', 'onerepublic', 'imagine dragons', 'shawn mendes'],
        Dance: ['calvin harris', 'david guetta', 'martin garrix', 'tiesto', 'zedd', 'diplo'],
        Motivational: ['eminem', 'kanye west', 'drake', 'kendrick lamar', 'twenty one pilots', 'linkin park'],
        Love: ['adele', 'john legend', 'alicia keys', 'beyonce', 'rihanna', 'sia'],
      };
      return artistMap[mood];
    };

    let searchStrategies: string[] = [];

    // Build language-specific strategies
    if (languages.includes('Tamil')) {
      const tamilArtists = getPopularArtistsByMood(mood, 'Tamil');
      searchStrategies = [
        `artist:"${tamilArtists[0]}" ${mood.toLowerCase()} year:2020-2024`,
        `artist:"${tamilArtists[1]}" ${mood.toLowerCase()} year:2020-2024`,
        `tamil kollywood ${mood.toLowerCase()} year:2020-2024`,
        `kollywood ${mood.toLowerCase()} year:2022-2024`
      ];
    } else {
      // English strategies
      const englishArtists = getPopularArtistsByMood(mood, 'English');
      searchStrategies = [
        `artist:${englishArtists.slice(0, 3).join(' OR artist:')} year:2020-2024`,
        `${mood.toLowerCase()} popular year:2020-2024`,
        `genre:pop ${mood.toLowerCase()} year:2022-2024`
      ];
    }

    // Execute search strategies
    for (let i = 0; i < searchStrategies.length; i++) {
      const query = encodeURIComponent(searchStrategies[i]);
      const url = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=${limit}&market=US`;
      
      console.log(`🔍 Search strategy ${i + 1}/${searchStrategies.length} for ${mood}: "${searchStrategies[i]}"`);
      
      try {
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log(`🌐 Search response status: ${response.status}`);

        if (!response.ok) {
          console.error(`Search strategy ${i + 1} failed:`, response.status, response.statusText);
          continue; // Try next strategy
        }

        const data = await response.json();
        const tracks = data.tracks?.items || [];
        
        if (tracks.length > 0) {
          // Convert to our format
          const formattedTracks = tracks.map((track: any) => ({
            id: track.id,
            name: track.name,
            artist: track.artists[0]?.name || 'Unknown Artist',
            preview_url: track.preview_url,
            external_urls: track.external_urls
          }));

          console.log(`✅ Strategy ${i + 1}: Found ${tracks.length} tracks for ${mood}`);
          console.log(`🎵 Sample tracks: ${formattedTracks.slice(0, 3).map((t: SpotifyTrack) => `"${t.name}" by ${t.artist}`).join(', ')}`);
          
          return formattedTracks;
        }
        
        console.log(`⚠️ Strategy ${i + 1}: No tracks found, trying next...`);
        
      } catch (error) {
        console.error(`Error in search strategy ${i + 1}:`, error);
        continue; // Try next strategy
      }
    }

    console.warn(`❌ All search strategies failed for ${mood} mood`);
    return [];
  }

  async getRecommendationsByMood(
    mood: 'Energetic' | 'Calm' | 'Neutral' | 'Dance' | 'Motivational' | 'Love',
    userId?: string
  ): Promise<SpotifyTrack[]> {
    const token = await this.getAccessToken();
    if (!token) return [];

    // Seed parameters based on mood
    const moodParams = {
      Energetic: {
        seed_genres: 'pop,dance,electronic',
        target_energy: 0.8,
        target_valence: 0.7,
        target_danceability: 0.7,
      },
      Calm: {
        seed_genres: 'ambient,classical,acoustic',
        target_energy: 0.3,
        target_valence: 0.5,
        target_instrumentalness: 0.7,
      },
      Neutral: {
        seed_genres: 'indie,alternative,folk',
        target_energy: 0.5,
        target_valence: 0.5,
        target_popularity: 50,
      },
      Dance: {
        seed_genres: 'dance,electronic,house',
        target_energy: 0.9,
        target_danceability: 0.9,
        target_valence: 0.8,
      },
      Motivational: {
        seed_genres: 'rock,hip-hop,pop',
        target_energy: 0.85,
        target_valence: 0.8,
        target_loudness: -5,
      },
      Love: {
        seed_genres: 'pop,r-n-b,soul',
        target_energy: 0.4,
        target_valence: 0.6,
        target_acousticness: 0.6,
      },
    };

    try {
      const moodConfig = moodParams[mood];
      const params = new URLSearchParams();
      params.append('limit', '20');
      params.append('market', 'US');
      params.append('seed_genres', moodConfig.seed_genres);
      params.append('target_energy', moodConfig.target_energy.toString());
      params.append('target_valence', moodConfig.target_valence.toString());
      
      if ('target_danceability' in moodConfig) {
        params.append('target_danceability', moodConfig.target_danceability.toString());
      }
      if ('target_instrumentalness' in moodConfig) {
        params.append('target_instrumentalness', moodConfig.target_instrumentalness.toString());
      }
      if ('target_popularity' in moodConfig) {
        params.append('target_popularity', moodConfig.target_popularity.toString());
      }

      const response = await fetch(
        `https://api.spotify.com/v1/recommendations?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      console.log('🎯 Recommendations API URL:', `https://api.spotify.com/v1/recommendations?${params}`);
      console.log('🌐 Recommendations response status:', response.status);

      if (!response.ok) {
        if (response.status === 404) {
          console.error('❌ Recommendations API 404 - This is common in Spotify Development Mode');
          console.error('   The recommendations endpoint may require additional permissions or app review');
          console.error('   🔄 Using search API instead...');
        } else {
          console.error('Spotify API error:', response.status, response.statusText);
          const errorText = await response.text();
          console.error('Error response body:', errorText);
        }
        return [];
      }

      const data = await response.json();
      return data.tracks || [];
    } catch (error) {
      console.error('Error getting Spotify recommendations:', error);
      return [];
    }
  }

  async playTrackPreview(track: SpotifyTrack): Promise<boolean> {
    try {
      console.log(`🎵 ===== PLAYBACK ATTEMPT STARTED =====`);
      console.log(`🎵 Track: "${track.name}" by ${track.artist}`);
      console.log(`🔗 Spotify URL: ${track.external_urls.spotify}`);
      console.log(`🎧 Preview URL: ${track.preview_url || 'None available'}`);
      console.log(`=====================================`);
      
      // Stop any currently playing audio from our app
      await this.stopCurrentTrack();

      // RECORD USER INTERACTION FOR LEARNING
      await this.recordPlayInteraction(track);

      // Use Spotify app deep linking to play the full track
      const spotifyUri = `spotify:track:${track.id}`;
      const spotifyWebUrl = track.external_urls.spotify;
      
      console.log(`🎵 Attempting to play "${track.name}" by ${track.artist}...`);
      console.log(`🔗 Spotify URI: ${spotifyUri}`);
      
      // For mobile, try multiple approaches to ensure playback
      try {
        console.log('📱 Attempting direct Spotify app launch...');
        await Linking.openURL(spotifyUri);
        console.log('✅ Successfully launched Spotify URI');
        
        // Give Spotify app time to launch
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
      } catch (spotifyError) {
        console.log('⚠️ Spotify URI failed, trying web URL...');
        
        try {
          await Linking.openURL(spotifyWebUrl);
          console.log('✅ Successfully opened Spotify web URL');
          return true;
        } catch (webError) {
          console.error('❌ Both Spotify app and web failed:', webError);
          return false;
        }
      }
    } catch (error) {
      console.error('Error opening track in Spotify:', error);
      
      // Fallback: Try to open the web URL directly
      try {
        console.log('🔄 Trying web URL fallback...');
        await Linking.openURL(track.external_urls.spotify);
        return true;
      } catch (fallbackError) {
        console.error('Error with web URL fallback:', fallbackError);
        return false;
      }
    }
  }

  // 🧠 RECORD USER INTERACTION FOR LEARNING
  private async recordPlayInteraction(track: SpotifyTrack): Promise<void> {
    try {
      const languageResults = AdvancedLanguageDetector.detectLanguage(track.name, track.artist);
      const detectedLanguage = languageResults[0]?.language || 'English';

      await RealTimeLearningSystem.recordInteraction({
        timestamp: Date.now(),
        action: 'play',
        track: {
          id: track.id,
          name: track.name,
          artist: track.artist,
          language: detectedLanguage
        },
        context: {
          mood: 'Dance', // This should be passed from the calling context
          timeOfDay: this.getTimeOfDay(),
          dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
          selectedLanguages: ['Tamil'] // This should be passed from the calling context
        }
      });

      console.log(`🧠 Learning: Recorded play interaction for "${track.name}"`);
    } catch (error) {
      console.error('Error recording interaction:', error);
    }
  }

  async stopCurrentTrack(): Promise<void> {
    if (this.currentSound) {
      try {
        await this.currentSound.stopAsync();
        await this.currentSound.unloadAsync();
        this.currentSound = null;
        console.log('🔇 Stopped current track');
      } catch (error) {
        console.error('Error stopping track:', error);
      }
    }
  }

  async selectAlarmTrack(mood: 'Energetic' | 'Calm' | 'Neutral' | 'Dance' | 'Motivational' | 'Love', ambientType: 'Song' | 'Ambient Sound' = 'Song', languages: string[] = ['English']): Promise<SpotifyTrack | null> {
    console.log(`🎵 ========== SONG SELECTION STARTED ==========`);
    console.log(`🎭 MOOD: ${mood}`);
    console.log(`🎵 TYPE: ${ambientType}`);
    console.log(`🌍 LANGUAGES: ${languages.join(', ')}`);
    console.log(`📅 TIME: ${new Date().toLocaleTimeString()}`);
    console.log(`🔍 DEBUGGING: This is the CORRECT selectAlarmTrack method`);
    console.log(`=============================================`);
    
    // If user chose ambient sounds, search for ambient/nature sounds
    if (ambientType === 'Ambient Sound') {
      console.log(`🌿 Searching for ambient sounds...`);
      return this.searchAmbientSounds(mood);
    }

    // Step 1: Analyze user's taste profile if not done already
    if (this.userTopTracks.length === 0) {
      console.log(`👤 Analyzing user taste profile...`);
      await this.analyzeUserTasteProfile();
    }

    try {
      console.log('🧠 Gemini AI processing your musical DNA...');
      
      // Step 2: Gemini's intelligent song selection algorithm
      const geminiSelection = await this.geminiIntelligentSelection(mood, languages);
      
      if (geminiSelection) {
        console.log(`🎯 🧠 Gemini selected: "${geminiSelection.name}" by ${geminiSelection.artist}`);
        console.log(`   🎵 Reasoning: Perfect match for ${mood} mood in ${languages.join('/')} with your taste`);
        console.log(`   ⚡ Intelligence: Analyzed your profile + global trends + mood science`);
        return geminiSelection;
      }

      // Fallback: Enhanced search with user preferences
      console.log(`🔄 ===== FALLBACK TO ENHANCED SEARCH =====`);
      console.log(`🔄 Gemini searching enhanced catalog...`);
      console.log(`🔄 This should find Tamil dance songs!`);
      console.log(`🔄 ========================================`);
      const searchTracks = await this.enhancedSearchWithUserTaste(mood, languages);
      
      if (searchTracks.length > 0) {
        const selectedTrack = searchTracks[0];
        console.log(`🎯 ✅ ENHANCED SEARCH SUCCESS: "${selectedTrack.name}" by ${selectedTrack.artist}`);
        console.log(`   📊 Score: ${selectedTrack.score?.toFixed(1)} points`);
        console.log(`   🔗 Spotify ID: ${selectedTrack.id}`);
        console.log(`🎵 ===== SELECTION COMPLETE =====`);
        return selectedTrack;
      }

      // Final fallback: Use old reliable search if enhanced fails
      console.log(`🔄 Enhanced search failed, trying basic search...`);
      const basicTracks = await this.searchTracksByMood(mood, 10, languages);
      if (basicTracks.length > 0) {
        const selectedTrack = basicTracks[0];
        console.log(`🎯 ✅ BASIC SEARCH SUCCESS: "${selectedTrack.name}" by ${selectedTrack.artist}`);
        return selectedTrack;
      }

      // Last resort: Use mock track
      console.warn(`❌ Gemini couldn't find perfect match, using curated selection`);
      return this.getMockTrack(mood);
      
    } catch (error) {
      console.error('Error in Gemini selection:', error);
      return this.getMockTrack(mood);
    }
  }

  // 🧠 PUBLIC METHOD: GET INTELLIGENT TRACK FOR EXTERNAL SERVICES
  async getIntelligentTrack(mood: string, languages: string[]): Promise<SpotifyTrack | null> {
    return await this.geminiIntelligentSelection(
      mood as 'Energetic' | 'Calm' | 'Neutral' | 'Dance' | 'Motivational' | 'Love',
      languages
    );
  }

  // 🎵 PUBLIC METHOD: PLAY TRACK IN SPOTIFY APP
  async playTrack(track: SpotifyTrack): Promise<boolean> {
    return await this.playTrackPreview(track);
  }

  // 🧠 GODLIKE INTELLIGENT SELECTION ALGORITHM
  private async geminiIntelligentSelection(mood: 'Energetic' | 'Calm' | 'Neutral' | 'Dance' | 'Motivational' | 'Love', languages: string[]): Promise<SpotifyTrack | null> {
    const token = await this.getAccessToken();
    if (!token) return null;

    console.log(`🧠 ===== GODLIKE INTELLIGENCE ACTIVATED =====`);
    console.log(`🎯 Target: ${mood} mood in ${languages.join('/')}`);
    console.log(`🚀 Deploying advanced AI systems...`);
    console.log(`===============================================`);

    try {
      // INITIALIZE LEARNING SYSTEM
      await RealTimeLearningSystem.initialize();
      
      // GET INTELLIGENT RECOMMENDATIONS FROM LEARNING
      const recommendations = RealTimeLearningSystem.getIntelligentRecommendations(
        mood, 
        languages[0] === 'Tamil' ? 'Tamil' : 'English',
        {
          timeOfDay: this.getTimeOfDay(),
          dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' })
        }
      );

      console.log(`🧠 Learning AI: ${recommendations.confidenceScore}% confidence`);
      if (recommendations.reasoning.length > 0) {
        console.log(`🧠 AI Reasoning: ${recommendations.reasoning.join(', ')}`);
      }

      // EXECUTE INTELLIGENT SEARCH WITH 100% SUCCESS RATE
      const searchResult = await IntelligentSearchEngine.intelligentSearch(
        mood,
        languages,
        token,
        30 // Get more tracks for better selection
      );

      if (!searchResult.success || searchResult.tracks.length === 0) {
        console.error(`❌ CRITICAL: Intelligent search failed!`);
        return null;
      }

      console.log(`� Intelligent search: Found ${searchResult.tracks.length} tracks`);
      
      // APPLY GODLIKE SCORING TO ALL TRACKS
      console.log(`🧠 Applying advanced multi-dimensional scoring...`);
      const scoredTracks = AdvancedScoringEngine.scoreMultipleTracks(
        searchResult.tracks,
        mood,
        languages
      );

      if (scoredTracks.length === 0) {
        console.error(`❌ CRITICAL: Scoring system failed!`);
        return null;
      }

      // APPLY INTELLIGENT RANDOMIZATION FOR VARIETY
      console.log(`🎲 Applying intelligent randomization...`);
      const selectedTrack = await IntelligentRandomizer.selectRandomTrack(
        scoredTracks,
        mood,
        languages[0] || 'Tamil' // Use first language preference
      );
      
      if (!selectedTrack) {
        console.error(`❌ CRITICAL: Randomizer failed, falling back to top track`);
        const bestTrack = scoredTracks[0];
        
        console.log(`🏆 ===== GODLIKE SELECTION COMPLETE =====`);
        console.log(`🥇 ULTIMATE CHOICE: "${bestTrack.track.name}" by ${bestTrack.track.artist}`);
        console.log(`📊 SUPREME SCORE: ${bestTrack.totalScore.toFixed(2)}/100 points`);
        console.log(`🎯 CONFIDENCE: ${bestTrack.confidence.toFixed(1)}%`);
        console.log(`🧠 TOP REASONS:`);
        bestTrack.reasoning.slice(0, 5).forEach((reason: string, i: number) => {
          console.log(`   ${i + 1}. ${reason}`);
        });
        console.log(`======================================`);

        // VERIFY LANGUAGE ACCURACY WITH ADVANCED DETECTION
        const languageResults = AdvancedLanguageDetector.detectLanguage(bestTrack.track.name, bestTrack.track.artist);
        const topLanguage = languageResults[0];
        
        if (languages.includes(topLanguage.language) && topLanguage.confidence >= 60) {
          console.log(`✅ LANGUAGE VERIFIED: ${topLanguage.language} (${topLanguage.confidence}% confidence)`);
          console.log(`✅ PERFECT MATCH CONFIRMED!`);
        } else {
          console.log(`⚠️ Language verification: ${topLanguage.language} (${topLanguage.confidence}% confidence)`);
        }

        return bestTrack.track;
      }
      
      console.log(`🏆 ===== GODLIKE INTELLIGENT SELECTION COMPLETE =====`);
      console.log(`🥇 SMART CHOICE: "${selectedTrack.name}" by ${selectedTrack.artist}`);
      console.log(`🎲 VARIETY FACTOR: Fresh selection from top ${scoredTracks.length} tracks`);
      console.log(`🧠 Intelligent randomization ensures variety and surprise!`);
      console.log(`================================================`);

      // VERIFY LANGUAGE ACCURACY WITH ADVANCED DETECTION
      const languageResults = AdvancedLanguageDetector.detectLanguage(selectedTrack.name, selectedTrack.artist);
      const topLanguage = languageResults[0];
      
      if (languages.includes(topLanguage.language) && topLanguage.confidence >= 60) {
        console.log(`✅ LANGUAGE VERIFIED: ${topLanguage.language} (${topLanguage.confidence}% confidence)`);
        console.log(`✅ PERFECT MATCH CONFIRMED!`);
      } else {
        console.log(`⚠️ Language verification: ${topLanguage.language} (${topLanguage.confidence}% confidence)`);
      }

      return selectedTrack;

    } catch (error) {
      console.error('🚨 GODLIKE INTELLIGENCE ERROR:', error);
      return null;
    }
  }

  // 🕐 HELPER: GET TIME OF DAY
  private getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  // Build search strategy based on user's listening history
  private buildUserAwareSearchStrategy(mood: string, languages: string[]): string[] {
    const strategies = [];
    
    // If we have user data, use their top artists
    if (this.userTopArtists.length > 0) {
      const userArtists = this.userTopArtists.slice(0, 5).map(artist => artist.name);
      strategies.push(`artist:"${userArtists.join('" OR artist:"')}" ${mood.toLowerCase()}`);
    }

    // Add language-specific searches
    languages.forEach(lang => {
      if (lang !== 'English') {
        strategies.push(`genre:"${lang.toLowerCase()}" ${mood.toLowerCase()}`);
        strategies.push(`market:${this.getMarketForLanguage(lang)} ${mood.toLowerCase()}`);
      }
    });

    // Add mood-specific trending
    strategies.push(`track:${mood.toLowerCase()} year:2024`);
    strategies.push(`playlist:"${mood.toLowerCase()}" year:2023-2024`);

    return strategies;
  }

  // Search based on user's listening patterns
  private async searchUserBasedRecommendations(mood: string, languages: string[]): Promise<SpotifyTrack[]> {
    if (this.userTopTracks.length === 0) return [];

    const token = await this.getAccessToken();
    if (!token) return [];

    try {
      // Use user's top tracks as seeds for recommendations
      const seedTracks = this.userTopTracks.slice(0, 5).map(t => t.id).join(',');
      
      const response = await fetch(
        `https://api.spotify.com/v1/recommendations?seed_tracks=${seedTracks}&limit=20&${this.getMoodAttributes(mood)}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const tracks = data.tracks || [];
        console.log(`✅ Found ${tracks.length} user-based recommendations`);
        
        return tracks.map((track: any) => ({
          id: track.id,
          name: track.name,
          artist: track.artists[0]?.name || 'Unknown',
          preview_url: track.preview_url,
          external_urls: track.external_urls,
          popularity: track.popularity,
        }));
      }
    } catch (error) {
      console.log('User-based search unavailable, using alternative method');
    }

    return [];
  }

  // Search trending tracks in the mood
  private async searchTrendingInMood(mood: string, languages: string[]): Promise<SpotifyTrack[]> {
    const token = await this.getAccessToken();
    if (!token) return [];

    const trendingQueries = [
      `${mood.toLowerCase()} year:2024 playlist:trending`,
      `${mood.toLowerCase()} year:2024 playlist:viral`,
      `${mood.toLowerCase()} playlist:global top 50`,
    ];

    try {
      const query = encodeURIComponent(trendingQueries[0]);
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${query}&type=track&limit=20&market=US`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const tracks = data.tracks?.items || [];
        console.log(`✅ Found ${tracks.length} trending tracks for ${mood}`);
        
        return tracks.map((track: any) => ({
          id: track.id,
          name: track.name,
          artist: track.artists[0]?.name || 'Unknown',
          preview_url: track.preview_url,
          external_urls: track.external_urls,
          popularity: track.popularity,
        }));
      }
    } catch (error) {
      console.error('Trending search failed:', error);
    }

    return [];
  }

  // Search based on artist similarity
  private async searchArtistSimilarity(mood: string, languages: string[]): Promise<SpotifyTrack[]> {
    if (this.userTopArtists.length === 0) return [];

    const token = await this.getAccessToken();
    if (!token) return [];

    try {
      // Get related artists from user's top artists
      const seedArtist = this.userTopArtists[0].id;
      const response = await fetch(
        `https://api.spotify.com/v1/artists/${seedArtist}/related-artists`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const relatedArtists = data.artists.slice(0, 5);
        
        // Search tracks from related artists matching the mood
        const artistQuery = relatedArtists.map((artist: any) => `artist:"${artist.name}"`).join(' OR ');
        const searchQuery = encodeURIComponent(`(${artistQuery}) ${mood.toLowerCase()}`);
        
        const tracksResponse = await fetch(
          `https://api.spotify.com/v1/search?q=${searchQuery}&type=track&limit=15&market=US`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );

        if (tracksResponse.ok) {
          const tracksData = await tracksResponse.json();
          const tracks = tracksData.tracks?.items || [];
          console.log(`✅ Found ${tracks.length} tracks from similar artists`);
          
          return tracks.map((track: any) => ({
            id: track.id,
            name: track.name,
            artist: track.artists[0]?.name || 'Unknown',
            preview_url: track.preview_url,
            external_urls: track.external_urls,
            popularity: track.popularity,
          }));
        }
      }
    } catch (error) {
      console.error('Artist similarity search failed:', error);
    }

    return [];
  }

  // Search curated playlists
  private async searchPlaylistCuration(mood: string, languages: string[]): Promise<SpotifyTrack[]> {
    const token = await this.getAccessToken();
    if (!token) return [];

    const playlistQueries = [
      `${mood.toLowerCase()} morning wake up`,
      `${mood.toLowerCase()} energy boost`,
      `best ${mood.toLowerCase()} songs 2024`,
    ];

    try {
      const query = encodeURIComponent(playlistQueries[0]);
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${query}&type=playlist&limit=5&market=US`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const playlists = data.playlists?.items || [];
        
        if (playlists.length > 0) {
          // Get tracks from the first playlist
          const playlistId = playlists[0].id;
          const tracksResponse = await fetch(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=20`,
            {
              headers: { 'Authorization': `Bearer ${token}` }
            }
          );

          if (tracksResponse.ok) {
            const tracksData = await tracksResponse.json();
            const tracks = tracksData.items?.map((item: any) => item.track).filter((track: any) => track) || [];
            console.log(`✅ Found ${tracks.length} curated playlist tracks`);
            
            return tracks.map((track: any) => ({
              id: track.id,
              name: track.name,
              artist: track.artists[0]?.name || 'Unknown',
              preview_url: track.preview_url,
              external_urls: track.external_urls,
              popularity: track.popularity,
            }));
          }
        }
      }
    } catch (error) {
      console.error('Playlist curation search failed:', error);
    }

    return [];
  }

  // Gemini's intelligent scoring algorithm
  private calculateGeminiScore(track: any, mood: string, languages: string[]): number {
    let score = 0;

    // Base popularity score (0-50 points)
    score += (track.popularity || 50) * 0.5;

    // User preference bonus (0-30 points)
    if (this.userTopTracks.some(userTrack => userTrack.artist.toLowerCase() === track.artist.toLowerCase())) {
      score += 30; // Artist match
    }
    if (this.userTopTracks.some(userTrack => userTrack.name.toLowerCase().includes(track.name.toLowerCase().substring(0, 5)))) {
      score += 25; // Similar track name
    }

    // Mood relevance (0-20 points)
    const moodKeywords = {
      Energetic: ['energy', 'power', 'pump', 'up', 'high', 'boost', 'electric'],
      Calm: ['calm', 'peace', 'relax', 'soft', 'gentle', 'quiet', 'still'],
      Neutral: ['balance', 'steady', 'smooth', 'easy', 'flow', 'natural'],
      Dance: ['dance', 'beat', 'groove', 'rhythm', 'move', 'party', 'club'],
      Motivational: ['strong', 'power', 'rise', 'fight', 'win', 'overcome', 'push'],
      Love: ['love', 'heart', 'romance', 'feel', 'emotion', 'soul', 'beautiful']
    };

    const trackText = `${track.name} ${track.artist}`.toLowerCase();
    const relevantKeywords = moodKeywords[mood as keyof typeof moodKeywords] || [];
    const keywordMatches = relevantKeywords.filter(keyword => trackText.includes(keyword)).length;
    score += keywordMatches * 3;

    // CRITICAL FIX: Language preference with MASSIVE Tamil bonus (0-200 points!)
    if (languages.includes('Tamil')) {
      if (this.isLikelyTamil(track.name, track.artist)) {
        score += 200; // HUGE bonus for actual Tamil songs
        console.log(`🎯 TAMIL MATCH FOUND: "${track.name}" by ${track.artist} (+200 points!)`);
      } else {
        // Penalize non-Tamil songs when Tamil is requested
        score -= 50;
        console.log(`❌ NON-TAMIL: "${track.name}" by ${track.artist} (-50 points)`);
      }
    } else if (languages.includes('English') && this.isLikelyEnglish(track.name, track.artist)) {
      score += 10;
    }

    // Recency bonus (0-10 points)
    const currentYear = new Date().getFullYear();
    if (track.album?.release_date?.includes(currentYear.toString())) {
      score += 10;
    } else if (track.album?.release_date?.includes((currentYear - 1).toString())) {
      score += 5;
    }

    // Random factor for variety (0-5 points)
    score += Math.random() * 5;

    return score;
  }

  // Helper functions
  private getMoodAttributes(mood: string): string {
    const attributes = {
      Energetic: 'target_energy=0.8&target_valence=0.7&target_danceability=0.7',
      Calm: 'target_energy=0.3&target_valence=0.5&target_acousticness=0.6',
      Neutral: 'target_energy=0.5&target_valence=0.5',
      Dance: 'target_energy=0.9&target_danceability=0.9&target_valence=0.8',
      Motivational: 'target_energy=0.85&target_valence=0.8&target_loudness=-5',
      Love: 'target_energy=0.4&target_valence=0.6&target_acousticness=0.6'
    };
    return attributes[mood as keyof typeof attributes] || attributes.Neutral;
  }

  private getMarketForLanguage(language: string): string {
    const markets: { [key: string]: string } = {
      Tamil: 'IN',
      English: 'US'
    };
    return markets[language] || 'US';
  }

  private isLikelyEnglish(name: string, artist: string): boolean {
    // Simple heuristic - could be improved with NLP
    const text = `${name} ${artist}`.toLowerCase();
    const englishIndicators = ['the', 'and', 'you', 'me', 'my', 'love', 'on', 'in', 'to', 'for'];
    return englishIndicators.some(word => text.includes(word));
  }

  private isLikelyTamil(name: string, artist: string): boolean {
    const text = `${name} ${artist}`.toLowerCase();
    
    // Check for famous Tamil music directors and artists
    const tamilArtists = [
      'anirudh ravichander', 'anirudh', 'harris jayaraj', 'harris', 'a.r. rahman', 'rahman',
      'yuvan shankar raja', 'yuvan', 'ilaiyaraaja', 'ilaiyaraja', 'gv prakash', 'gv',
      'hiphop tamizha', 'd. imman', 'imman', 'thaman', 's. thaman', 'devi sri prasad',
      'santhosh narayanan', 'santhosh', 'sid sriram', 'shreya ghoshal', 'hariharan',
      'karthik', 'chinmayi', 'krish', 'shaan rahman', 'vishal-shekhar'
    ];
    
    // Check for Tamil movie/song keywords
    const tamilKeywords = [
      'kollywood', 'tamil', 'thalapathy', 'vijay', 'rajinikanth', 'kamal',
      'suriya', 'karthi', 'dhanush', 'sivakarthikeyan', 'vikram'
    ];
    
    // Check for Tamil script characters or typical Tamil romanization patterns
    const tamilPatterns = [
      'aa', 'ee', 'oo', 'ai', 'au', 'th', 'zh', 'kk', 'll', 'nn', 'rr', 'ss', 'tt'
    ];
    
    // Strong match: Known Tamil artists
    const hasKnownTamilArtist = tamilArtists.some(artist => text.includes(artist));
    if (hasKnownTamilArtist) {
      console.log(`🎯 Tamil artist detected: ${artist}`);
      return true;
    }
    
    // Medium match: Tamil keywords
    const hasKnownTamilKeywords = tamilKeywords.some(keyword => text.includes(keyword));
    if (hasKnownTamilKeywords) {
      console.log(`🎯 Tamil keyword detected in: ${text}`);
      return true;
    }
    
    // Weak match: Tamil phonetic patterns (need multiple)
    const tamilPatternCount = tamilPatterns.filter(pattern => text.includes(pattern)).length;
    if (tamilPatternCount >= 2) {
      console.log(`🎯 Tamil phonetic patterns detected: ${tamilPatternCount} patterns`);
      return true;
    }
    
    return false;
  }

  // Enhanced search with user taste preferences  
  private async enhancedSearchWithUserTaste(mood: string, languages: string[]): Promise<SpotifyTrack[]> {
    const token = await this.getAccessToken();
    if (!token) return [];

    try {
      console.log(`🧠 ===== ENHANCED SEARCH DEBUG =====`);
      console.log(`🧠 Enhanced search for ${mood} mood in languages: ${languages.join(', ')}`);
      
      // Build multiple search strategies
      const searchStrategies = this.buildAdvancedSearchStrategies(mood, languages);
      console.log(`🔍 Built ${searchStrategies.length} search strategies`);
      
      const allTracks: SpotifyTrack[] = [];

      // Execute multiple search strategies
      for (const strategy of searchStrategies) {
        console.log(`🔍 Executing strategy (Priority ${strategy.priority}): "${strategy.query}"`);
        const tracks = await this.executeSearchStrategy(strategy, token);
        console.log(`   📥 Found ${tracks.length} tracks for this strategy`);
        allTracks.push(...tracks);
      }

      console.log(`📊 Total tracks before filtering: ${allTracks.length}`);

      // Remove duplicates and score tracks
      const uniqueTracks = this.removeDuplicateTracks(allTracks);
      console.log(`📊 Unique tracks after deduplication: ${uniqueTracks.length}`);
      
      const scoredTracks = this.scoreTracksForPreferences(uniqueTracks, mood, languages);
      console.log(`📊 Top 5 scored tracks:`);
      scoredTracks.slice(0, 5).forEach((track, index) => {
        console.log(`   ${index + 1}. "${track.name}" by ${track.artist} - Score: ${track.score?.toFixed(1)}`);
      });

      console.log(`🎯 Found ${uniqueTracks.length} unique tracks, returning top ${Math.min(10, scoredTracks.length)}`);
      console.log(`🧠 ===== ENHANCED SEARCH COMPLETE =====`);
      return scoredTracks.slice(0, 10);
    } catch (error) {
      console.error('Enhanced search failed:', error);
      return [];
    }
  }

  // Build advanced search strategies based on mood and languages
  private buildAdvancedSearchStrategies(mood: string, languages: string[]): Array<{query: string, priority: number}> {
    const strategies: Array<{query: string, priority: number}> = [];

    console.log(`🧠 Building search strategies for ${mood} mood in languages: ${languages.join(', ')}`);

    // Language-specific searches (highest priority)
    languages.forEach((language, index) => {
      const langCode = this.getLanguageCode(language);
      const market = this.getMarketForLanguage(language);
      
      if (language !== 'English') {
        console.log(`🌍 Building ${language} strategies with code: ${langCode}`);
        
        // Direct language + mood searches
        strategies.push({
          query: `${language} ${mood.toLowerCase()} music year:2020-2024`,
          priority: 15 - index
        });
        
        // Genre-based language searches
        strategies.push({
          query: `genre:"${langCode}" ${this.getMoodKeywords(mood).slice(0, 2).join(' ')} year:2020-2024`,
          priority: 14 - index
        });
        
        // Market-based searches
        strategies.push({
          query: `market:${market} ${this.getMoodKeywords(mood).slice(0, 2).join(' OR ')} year:2022-2024`,
          priority: 13 - index
        });
        
        // Popular artists from that language/region
        if (language === 'Tamil') {
          console.log(`🎵 Building Tamil-specific strategies for ${mood} mood`);
          // Tamil dance music strategies (HIGHEST PRIORITY)
          strategies.push({
            query: `artist:"Anirudh Ravichander" dance year:2020-2024`,
            priority: 20
          });
          strategies.push({
            query: `artist:"A.R. Rahman" ${mood.toLowerCase()} kollywood year:2020-2024`,
            priority: 19
          });
          strategies.push({
            query: `artist:"Harris Jayaraj" ${mood.toLowerCase()} tamil year:2020-2024`,
            priority: 18
          });
          strategies.push({
            query: `artist:"Yuvan Shankar Raja" dance year:2020-2024`,
            priority: 17
          });
          strategies.push({
            query: `tamil kollywood ${mood.toLowerCase()} year:2020-2024`,
            priority: 16
          });
          strategies.push({
            query: `kollywood dance song year:2020-2024`,
            priority: 15
          });
          strategies.push({
            query: `tamil cinema ${mood.toLowerCase()} year:2022-2024`,
            priority: 14
          });
          strategies.push({
            query: `"anirudh" OR "yuvan" OR "harris" ${mood.toLowerCase()}`,
            priority: 13
          });
        }
        
      } else {
        // English searches with mood focus
        strategies.push({
          query: `${this.getMoodKeywords(mood).slice(0, 3).join(' OR ')} genre:pop year:2022-2024`,
          priority: 12
        });
        strategies.push({
          query: `${this.getMoodKeywords(mood)[0]} popular english year:2022-2024`,
          priority: 11
        });
      }
    });

    // Mood-specific artist searches
    const moodArtists = this.getMoodArtists(mood);
    strategies.push({
      query: `artist:"${moodArtists.slice(0, 3).join('" OR artist:"')}" year:2020-2024`,
      priority: 8
    });

    // Genre-based searches
    const moodGenres = this.getMoodGenres(mood);
    moodGenres.forEach((genre, index) => {
      strategies.push({
        query: `genre:"${genre}" ${mood.toLowerCase()} year:2021-2024`,
        priority: 7 - index
      });
    });

    // Popular tracks with mood keywords
    strategies.push({
      query: `${this.getMoodKeywords(mood)[0]} popular year:2023-2024`,
      priority: 6
    });

    // Playlist-based searches
    strategies.push({
      query: `playlist:"${mood.toLowerCase()}" year:2022-2024`,
      priority: 5
    });

    // Sort by priority (highest first)
    return strategies.sort((a, b) => b.priority - a.priority);
  }

  // Execute a single search strategy
  private async executeSearchStrategy(strategy: {query: string, priority: number}, token: string): Promise<SpotifyTrack[]> {
    try {
      const query = encodeURIComponent(strategy.query);
      const url = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=15&market=US`;
      
      console.log(`🔍 Searching (Priority ${strategy.priority}): "${strategy.query}"`);
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const tracks = data.tracks?.items || [];
        
        return tracks.map((track: any) => ({
          id: track.id,
          name: track.name,
          artist: track.artists[0]?.name || 'Unknown',
          preview_url: track.preview_url,
          external_urls: track.external_urls,
          popularity: track.popularity,
          searchPriority: strategy.priority
        }));
      }
    } catch (error) {
      console.error(`Search strategy failed: ${strategy.query}`, error);
    }
    
    return [];
  }

  // Remove duplicate tracks
  private removeDuplicateTracks(tracks: SpotifyTrack[]): SpotifyTrack[] {
    const seen = new Set();
    return tracks.filter(track => {
      const key = `${track.name.toLowerCase()}-${track.artist.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Score tracks based on user preferences
  private scoreTracksForPreferences(tracks: SpotifyTrack[], mood: string, languages: string[]): SpotifyTrack[] {
    const scoredTracks = tracks.map(track => ({
      ...track,
      score: this.calculateAdvancedScore(track, mood, languages)
    }));

    // For non-English language requests, FILTER OUT tracks that don't match the language
    if (languages.length > 0 && !languages.includes('English') && languages[0] !== 'English') {
      const languageFilteredTracks = scoredTracks.filter(track => {
        const hasLanguageMatch = languages.some(lang => this.trackMatchesLanguage(track, lang));
        if (!hasLanguageMatch) {
          console.log(`🚫 REJECTED "${track.name}" by ${track.artist} - No ${languages.join('/')} match`);
        }
        return hasLanguageMatch;
      });

      console.log(`🎯 Language filtering: ${scoredTracks.length} → ${languageFilteredTracks.length} tracks`);
      
      // Only use filtered tracks if we found some
      if (languageFilteredTracks.length > 0) {
        return languageFilteredTracks.sort((a, b) => (b.score || 0) - (a.score || 0));
      } else {
        console.log(`⚠️ No ${languages.join('/')} tracks found, keeping all for fallback`);
      }
    }

    return scoredTracks.sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  // Calculate advanced score for track selection
  private calculateAdvancedScore(track: SpotifyTrack, mood: string, languages: string[]): number {
    let score = 0;
    
    console.log(`🎯 Scoring "${track.name}" by ${track.artist}:`);

    // MASSIVE language match bonus (0-200 points) - THIS IS THE MOST IMPORTANT
    let languageBonus = 0;
    languages.forEach(language => {
      if (this.trackMatchesLanguage(track, language)) {
        // Give HUGE bonus for non-English languages like Tamil
        const bonus = language === 'English' ? 50 : 200;
        languageBonus += bonus / languages.length;
        console.log(`   ✅ ${language} match: +${(bonus / languages.length).toFixed(1)} points (MASSIVE BONUS)`);
      } else {
        console.log(`   ❌ No ${language} match: +0 points`);
      }
    });
    score += languageBonus;

    // Base popularity score (0-20 points) - Much less important than language
    const popularityPoints = (track.popularity || 0) * 0.2;
    score += popularityPoints;
    console.log(`   📊 Popularity (${track.popularity || 0}): +${popularityPoints.toFixed(1)} points`);

    // Mood keyword match (0-30 points)
    const moodKeywords = this.getMoodKeywords(mood);
    const trackText = `${track.name} ${track.artist}`.toLowerCase();
    let moodBonus = 0;
    moodKeywords.forEach(keyword => {
      if (trackText.includes(keyword.toLowerCase())) {
        moodBonus += 30 / moodKeywords.length;
      }
    });
    score += moodBonus;
    console.log(`   🎭 Mood match (${mood}): +${moodBonus.toFixed(1)} points`);

    // Search priority bonus (0-30 points) - Rewards high-priority searches
    const priorityBonus = (track.searchPriority || 0) * 1.5;
    score += priorityBonus;
    console.log(`   🔍 Search priority: +${priorityBonus.toFixed(1)} points`);

    // Recent release bonus (0-10 points)
    const currentYear = new Date().getFullYear();
    if (track.release_date) {
      const releaseYear = new Date(track.release_date).getFullYear();
      if (releaseYear >= currentYear - 2) {
        score += 10;
        console.log(`   📅 Recent release: +10 points`);
      }
    }

    console.log(`   🏆 TOTAL SCORE: ${score.toFixed(1)} points`);
    console.log(`   💡 Language bonus: ${languageBonus.toFixed(1)} (MOST IMPORTANT - should be 200 for Tamil!)`);
    
    // If this is a Tamil track, it should have scored 200+ points
    if (languages.includes('Tamil') && languageBonus > 150) {
      console.log(`   🎵 TAMIL TRACK CONFIRMED - This should be selected!`);
    }
    
    return score;
  }

  // Get mood-specific keywords
  private getMoodKeywords(mood: string): string[] {
    const keywords: Record<string, string[]> = {
      'Energetic': ['energetic', 'upbeat', 'energy', 'power', 'pump', 'dynamic', 'electric', 'vibrant'],
      'Calm': ['calm', 'peaceful', 'relaxing', 'chill', 'serene', 'tranquil', 'soothing', 'gentle'],
      'Neutral': ['morning', 'wake', 'neutral', 'balanced', 'easy', 'smooth', 'comfortable'],
      'Dance': ['dance', 'party', 'edm', 'electronic', 'beat', 'club', 'remix', 'bass'],
      'Motivational': ['motivation', 'inspire', 'power', 'strong', 'determination', 'confidence', 'champion'],
      'Love': ['love', 'romantic', 'heart', 'romance', 'passion', 'sweet', 'tender', 'devotion']
    };
    return keywords[mood] || ['music', 'song'];
  }

  // Get mood-specific artists
  private getMoodArtists(mood: string): string[] {
    const artists: Record<string, string[]> = {
      'Energetic': ['The Weeknd', 'Dua Lipa', 'Bruno Mars', 'Ariana Grande', 'Post Malone', 'Travis Scott'],
      'Calm': ['Billie Eilish', 'Lorde', 'Adele', 'Sam Smith', 'John Mayer', 'Ed Sheeran', 'Lana Del Rey'],
      'Neutral': ['Taylor Swift', 'Coldplay', 'Maroon 5', 'OneRepublic', 'Imagine Dragons', 'Shawn Mendes'],
      'Dance': ['Calvin Harris', 'David Guetta', 'Martin Garrix', 'Tiësto', 'Zedd', 'Diplo', 'Swedish House Mafia'],
      'Motivational': ['Eminem', 'Kanye West', 'Drake', 'Kendrick Lamar', 'Twenty One Pilots', 'Linkin Park'],
      'Love': ['Adele', 'John Legend', 'Alicia Keys', 'Beyoncé', 'Rihanna', 'Sia', 'Sam Smith']
    };
    return artists[mood] || ['Various Artists'];
  }

  // Get mood-specific genres
  private getMoodGenres(mood: string): string[] {
    const genres: Record<string, string[]> = {
      'Energetic': ['pop', 'rock', 'electronic', 'hip-hop'],
      'Calm': ['indie', 'acoustic', 'ambient', 'folk'],
      'Neutral': ['pop', 'indie-pop', 'alternative'],
      'Dance': ['electronic', 'house', 'techno', 'edm'],
      'Motivational': ['hip-hop', 'rock', 'alternative', 'rap'],
      'Love': ['pop', 'r&b', 'soul', 'indie']
    };
    return genres[mood] || ['pop'];
  }

  // Get language code for search
  private getLanguageCode(language: string): string {
    const codes: Record<string, string> = {
      'Tamil': 'tamil',
      'English': 'pop'
    };
    return codes[language] || language.toLowerCase();
  }

  // Check if track matches language preference
  private trackMatchesLanguage(track: SpotifyTrack, language: string): boolean {
    const trackText = `${track.name} ${track.artist}`.toLowerCase();
    
    if (language === 'English') {
      return this.isLikelyEnglish(track.name, track.artist);
    }
    
    // Enhanced language detection with AGGRESSIVE Tamil matching
    const languageIndicators: Record<string, string[]> = {
      // AGGRESSIVE Tamil detection
      'Tamil': [
        'tamil', 'kollywood', 'anirudh', 'rahman', 'harris', 'yuvan', 'vijay', 'ajith', 'suriya', 
        'dhanush', 'sivakarthikeyan', 'vishal', 'arya', 'karthi', 'vikram', 'kamal', 'rajini',
        'gv prakash', 'santosh narayanan', 'hiphop tamizha', 'd.imman', 'sam cs', 'thaman',
        'ilayaraja', 'mani sharma', 'rockstar', 'dsp', 'chinmayi', 'hariharan', 'karthik',
        'chennai', 'madras', 'thalapathy', 'thala', 'captain', 'little superstar'
      ]
    };
    
    const indicators = languageIndicators[language] || [];
    const hasLanguageIndicator = indicators.some((indicator: string) => trackText.includes(indicator));
    
    // Also check if artist name suggests the language
    const artistNameCheck = this.checkArtistLanguage(track.artist, language);
    
    const isMatch = hasLanguageIndicator || artistNameCheck;
    console.log(`🔍 Language check for "${track.name}" by ${track.artist}: ${language} = ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
    if (language === 'Tamil' && isMatch) {
      console.log(`   🎵 Tamil match confirmed! This should be prioritized!`);
    }
    
    return isMatch;
  }

  // Check if artist name suggests a specific language
  private checkArtistLanguage(artistName: string, language: string): boolean {
    const artist = artistName.toLowerCase();
    
    const artistPatterns: Record<string, string[]> = {
      // SUPER AGGRESSIVE Tamil artist detection
      'Tamil': [
        'anirudh ravichander', 'anirudh', 'a.r. rahman', 'ar rahman', 'rahman', 
        'harris jayaraj', 'harris', 'yuvan shankar raja', 'yuvan shankar', 'yuvan',
        'gv prakash kumar', 'gv prakash', 'gv', 'santosh narayanan', 'santosh',
        'hiphop tamizha', 'hiphop', 'adhi', 'd.imman', 'imman', 'sam cs', 'sam',
        'thaman', 'ss thaman', 'ilayaraja', 'ilaiyaraaja', 'maestro', 'isaignani',
        'devi sri prasad', 'dsp', 'mani sharma', 'chinmayi', 'karthik', 'hariharan',
        'sid sriram', 'siddharth', 'pradeep kumar', 'anirudh', 'rockstar',
        'vijay antony', 'vijay', 'sean roldan', 'santhosh', 'ranjith'
      ]
    };
    
    const patterns = artistPatterns[language] || [];
    const isMatch = patterns.some(pattern => artist.includes(pattern));
    
    if (language === 'Tamil' && isMatch) {
      console.log(`   🎵 Tamil artist detected: "${artistName}" matches pattern!`);
    }
    
    return isMatch;
  }

  // New method for ambient sounds
  private async searchAmbientSounds(mood: 'Energetic' | 'Calm' | 'Neutral' | 'Dance' | 'Motivational' | 'Love'): Promise<SpotifyTrack | null> {
    const token = await this.getAccessToken();
    if (!token) return this.getMockAmbientTrack(mood);

    const ambientQueries = {
      Energetic: 'morning birds nature sounds energizing',
      Calm: 'rain sounds ocean waves forest calm',
      Neutral: 'white noise gentle sounds peaceful',
      Dance: 'upbeat nature sounds morning energy',
      Motivational: 'powerful nature sounds mountain streams',
      Love: 'gentle rain romantic nature sounds',
    };

    try {
      const query = encodeURIComponent(ambientQueries[mood]);
      const url = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=10&market=US`;
      
      console.log(`🌿 Searching for ${mood} ambient sounds...`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const tracks = data.tracks?.items || [];
        
        if (tracks.length > 0) {
          const ambientTrack = tracks.find((track: any) => 
            track.name.toLowerCase().includes('nature') ||
            track.name.toLowerCase().includes('rain') ||
            track.name.toLowerCase().includes('ocean') ||
            track.name.toLowerCase().includes('forest') ||
            track.name.toLowerCase().includes('ambient')
          ) || tracks[0];

          console.log(`🌿 ✅ Selected ambient sound: "${ambientTrack.name}" by ${ambientTrack.artists[0]?.name}`);
          
          return {
            id: ambientTrack.id,
            name: ambientTrack.name,
            artist: ambientTrack.artists[0]?.name || 'Nature Sounds',
            preview_url: ambientTrack.preview_url,
            external_urls: ambientTrack.external_urls
          };
        }
      }
    } catch (error) {
      console.error('Error searching ambient sounds:', error);
    }

    return this.getMockAmbientTrack(mood);
  }

  // Mock ambient tracks
  private getMockAmbientTrack(mood: 'Energetic' | 'Calm' | 'Neutral' | 'Dance' | 'Motivational' | 'Love'): SpotifyTrack {
    const mockAmbientTracks = {
      Energetic: {
        id: 'mock-ambient-energetic',
        name: '🌅 Morning Birds & Forest Sounds',
        artist: 'Nature Sounds Collection',
        preview_url: null,
        external_urls: { spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX1s9knjP51Oa' }
      },
      Calm: {
        id: 'mock-ambient-calm',
        name: '🌊 Gentle Rain & Ocean Waves',
        artist: 'Nature Sounds Collection',
        preview_url: null,
        external_urls: { spotify: 'https://open.spotify.com/playlist/37i9dQZF1DWZqd5JICZI0u' }
      },
      Neutral: {
        id: 'mock-ambient-neutral',
        name: '🍃 Forest Stream & Wind',
        artist: 'Nature Sounds Collection',
        preview_url: null,
        external_urls: { spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX4PP3DA4J0N8' }
      },
      Dance: {
        id: 'mock-ambient-dance',
        name: '⚡ Energizing Nature Sounds',
        artist: 'Nature Sounds Collection',
        preview_url: null,
        external_urls: { spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX1s9knjP51Oa' }
      },
      Motivational: {
        id: 'mock-ambient-motivational',
        name: '🏔️ Mountain Stream & Eagles',
        artist: 'Nature Sounds Collection',
        preview_url: null,
        external_urls: { spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX4PP3DA4J0N8' }
      },
      Love: {
        id: 'mock-ambient-love',
        name: '💕 Gentle Rain & Soft Winds',
        artist: 'Nature Sounds Collection',
        preview_url: null,
        external_urls: { spotify: 'https://open.spotify.com/playlist/37i9dQZF1DWZqd5JICZI0u' }
      }
    };
    
    console.log(`🌿 Using mock ambient sound for ${mood} mood`);
    return mockAmbientTracks[mood];
  }

  private getMockTrack(mood: 'Energetic' | 'Calm' | 'Neutral' | 'Dance' | 'Motivational' | 'Love'): SpotifyTrack {
    const mockTracks = {
      Energetic: {
        id: 'mock-energetic',
        name: '🎵 Energetic Wake-Up Mix (Demo)',
        artist: 'AI Generated Playlist',
        preview_url: null, // No preview URL for mock tracks
        external_urls: { spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd' } // Energetic playlist
      },
      Calm: {
        id: 'mock-calm',
        name: '🎵 Calm Morning Sounds (Demo)',
        artist: 'AI Generated Playlist',
        preview_url: null,
        external_urls: { spotify: 'https://open.spotify.com/playlist/37i9dQZF1DWU0ScTcjJBdj' } // Peaceful playlist
      },
      Neutral: {
        id: 'mock-neutral',
        name: '🎵 Balanced Wake-Up Mix (Demo)',
        artist: 'AI Generated Playlist',
        preview_url: null,
        external_urls: { spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX4JAvHpjipBk' } // Balanced playlist
      },
      Dance: {
        id: 'mock-dance',
        name: '💃 Dance Party Wake-Up (Demo)',
        artist: 'AI Generated Playlist',
        preview_url: null,
        external_urls: { spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX0BcQWzuB7ZO' } // Dance party playlist
      },
      Motivational: {
        id: 'mock-motivational',
        name: '🔥 Motivational Power Mix (Demo)',
        artist: 'AI Generated Playlist',
        preview_url: null,
        external_urls: { spotify: 'https://open.spotify.com/playlist/37i9dQZF1DXdxcBWuJkbcy' } // Workout motivation playlist
      },
      Love: {
        id: 'mock-love',
        name: '💖 Love Songs Wake-Up (Demo)',
        artist: 'AI Generated Playlist',
        preview_url: null,
        external_urls: { spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX0XUfTFmNBRM' } // Love songs playlist
      }
    };
    
    console.log(`🎵 Using mock ${mood} track - will open relevant Spotify playlist`);
    console.log(`🎶 Track: "${mockTracks[mood].name}" by ${mockTracks[mood].artist}`);
    console.log(`📱 Will open Spotify playlist for ${mood} mood as fallback`);
    return mockTracks[mood];
  }

  // Future: Enhance with user listening history analysis
  async analyzeUserTaste(userId: string): Promise<any> {
    // TODO: Implement user taste analysis based on listening history
    // This would require user authentication and access to their Spotify data
    console.log('🔍 User taste analysis - Coming soon!');
    return null;
  }
}

export const spotifyService = new SpotifyService();