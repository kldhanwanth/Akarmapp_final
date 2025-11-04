// 🎲 INTELLIGENT SONG RANDOMIZATION SYSTEM
// Ensures different songs every time while maintaining quality

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PlayHistory {
  trackId: string;
  trackName: string;
  artist: string;
  mood: string;
  language: string;
  playCount: number;
  lastPlayed: number;
  userRating?: number; // 1-5 stars
}

export interface RandomizationConfig {
  minTimeBetweenReplays: number; // Minutes before same song can play again
  maxRecentTracks: number; // Number of recent tracks to avoid
  varietyBonus: number; // Extra points for songs not played recently
  qualityThreshold: number; // Minimum quality score to consider
}

export class IntelligentRandomizer {
  private static readonly STORAGE_KEY = 'song_play_history';
  private static readonly DEFAULT_CONFIG: RandomizationConfig = {
    minTimeBetweenReplays: 4 * 60, // 4 hours
    maxRecentTracks: 20,
    varietyBonus: 50,
    qualityThreshold: 60
  };

  private static playHistory: PlayHistory[] = [];

  // 🚀 INITIALIZE RANDOMIZER
  static async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.playHistory = JSON.parse(stored);
        console.log(`🎲 Randomizer loaded: ${this.playHistory.length} tracks in history`);
      } else {
        this.playHistory = [];
        console.log('🆕 New randomizer initialized');
      }
    } catch (error) {
      console.error('Error initializing randomizer:', error);
      this.playHistory = [];
    }
  }

  // 🎯 INTELLIGENT TRACK SELECTION WITH RANDOMIZATION
  static async selectRandomTrack(
    scoredTracks: Array<{ track: any; totalScore: number; confidence: number }>,
    mood: string,
    language: string,
    config: Partial<RandomizationConfig> = {}
  ): Promise<any | null> {
    
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    const now = Date.now();
    
    console.log(`🎲 ===== INTELLIGENT RANDOMIZATION =====`);
    console.log(`🎯 Target: ${mood} in ${language}`);
    console.log(`📊 Available tracks: ${scoredTracks.length}`);
    
    if (scoredTracks.length === 0) return null;

    // 1. FILTER OUT RECENTLY PLAYED TRACKS
    const recentlyPlayed = this.getRecentlyPlayed(mood, language, finalConfig);
    console.log(`🚫 Recently played tracks: ${recentlyPlayed.length}`);
    
    const availableTracks = scoredTracks.filter(scored => {
      const isRecent = recentlyPlayed.some(recent => 
        recent.trackId === scored.track.id ||
        (recent.trackName === scored.track.name && recent.artist === scored.track.artist)
      );
      return !isRecent;
    });

    console.log(`✅ Available after filtering: ${availableTracks.length}`);

    // 2. APPLY VARIETY BONUS TO TRACKS
    const tracksWithVarietyBonus = availableTracks.map(scored => {
      const playHistory = this.getTrackHistory(scored.track.id, scored.track.name, scored.track.artist);
      
      let varietyScore = scored.totalScore;
      
      if (!playHistory) {
        // Never played before - huge bonus!
        varietyScore += finalConfig.varietyBonus;
        console.log(`🆕 NEW TRACK: "${scored.track.name}" (+${finalConfig.varietyBonus} variety bonus)`);
      } else {
        // Played before - check how long ago
        const timeSinceLastPlay = (now - playHistory.lastPlayed) / (1000 * 60); // minutes
        const timeBonus = Math.min(30, timeSinceLastPlay / 10); // Up to 30 points for time
        varietyScore += timeBonus;
        
        // Penalty for frequently played tracks
        if (playHistory.playCount > 3) {
          varietyScore -= playHistory.playCount * 5;
          console.log(`🔄 FREQUENT TRACK: "${scored.track.name}" (played ${playHistory.playCount} times, -${playHistory.playCount * 5} penalty)`);
        }
      }
      
      return {
        ...scored,
        finalScore: varietyScore,
        varietyBonus: varietyScore - scored.totalScore
      };
    });

    // 3. SMART SELECTION ALGORITHM
    if (tracksWithVarietyBonus.length === 0) {
      // Emergency: Use original tracks if all are filtered out
      console.log(`🆘 EMERGENCY: Using original tracks (all were recently played)`);
      const selected = scoredTracks[Math.floor(Math.random() * Math.min(5, scoredTracks.length))];
      await this.recordPlay(selected.track, mood, language);
      return selected.track;
    }

    // Sort by final score (quality + variety)
    tracksWithVarietyBonus.sort((a, b) => b.finalScore - a.finalScore);

    // 4. WEIGHTED RANDOM SELECTION FROM TOP TRACKS
    const topTracks = tracksWithVarietyBonus.slice(0, Math.min(8, tracksWithVarietyBonus.length));
    console.log(`🎯 Top candidates after variety scoring:`);
    topTracks.forEach((track, i) => {
      console.log(`   ${i + 1}. "${track.track.name}" by ${track.track.artist} (Final: ${track.finalScore.toFixed(1)}, Variety: +${track.varietyBonus.toFixed(1)})`);
    });

    // Weighted selection: higher scores have higher probability
    const selectedTrack = this.weightedRandomSelection(topTracks);
    
    console.log(`🎲 RANDOMIZED SELECTION: "${selectedTrack.track.name}" by ${selectedTrack.track.artist}`);
    console.log(`🎯 Selection reasoning: Quality ${selectedTrack.totalScore.toFixed(1)} + Variety ${selectedTrack.varietyBonus.toFixed(1)} = ${selectedTrack.finalScore.toFixed(1)}`);
    console.log(`====================================`);

    // 5. RECORD THE SELECTION
    await this.recordPlay(selectedTrack.track, mood, language);

    return selectedTrack.track;
  }

  // 🎯 WEIGHTED RANDOM SELECTION
  private static weightedRandomSelection(tracks: Array<{ track: any; finalScore: number }>): any {
    // Create weighted distribution
    const weights = tracks.map(t => Math.max(1, t.finalScore)); // Ensure positive weights
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    
    // Random selection based on weights
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < tracks.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return tracks[i];
      }
    }
    
    // Fallback to first track
    return tracks[0];
  }

  // 📝 RECORD TRACK PLAY
  private static async recordPlay(track: any, mood: string, language: string): Promise<void> {
    try {
      const existingIndex = this.playHistory.findIndex(h => 
        h.trackId === track.id ||
        (h.trackName === track.name && h.artist === track.artist)
      );

      if (existingIndex >= 0) {
        // Update existing entry
        this.playHistory[existingIndex].playCount++;
        this.playHistory[existingIndex].lastPlayed = Date.now();
        console.log(`🔄 Updated play count: "${track.name}" (${this.playHistory[existingIndex].playCount} times)`);
      } else {
        // Add new entry
        this.playHistory.push({
          trackId: track.id,
          trackName: track.name,
          artist: track.artist,
          mood,
          language,
          playCount: 1,
          lastPlayed: Date.now()
        });
        console.log(`🆕 Added to history: "${track.name}" by ${track.artist}`);
      }

      // Keep only recent history (prevent unlimited growth)
      this.playHistory = this.playHistory
        .sort((a, b) => b.lastPlayed - a.lastPlayed)
        .slice(0, 200); // Keep last 200 tracks

      await this.saveHistory();
    } catch (error) {
      console.error('Error recording play:', error);
    }
  }

  // 📚 GET RECENTLY PLAYED TRACKS
  private static getRecentlyPlayed(
    mood: string, 
    language: string, 
    config: RandomizationConfig
  ): PlayHistory[] {
    const cutoffTime = Date.now() - (config.minTimeBetweenReplays * 60 * 1000);
    
    return this.playHistory
      .filter(h => 
        h.mood === mood && 
        h.language === language && 
        h.lastPlayed > cutoffTime
      )
      .slice(0, config.maxRecentTracks);
  }

  // 🔍 GET TRACK HISTORY
  private static getTrackHistory(trackId: string, trackName: string, artist: string): PlayHistory | null {
    return this.playHistory.find(h => 
      h.trackId === trackId ||
      (h.trackName === trackName && h.artist === artist)
    ) || null;
  }

  // 💾 SAVE HISTORY
  private static async saveHistory(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.playHistory));
    } catch (error) {
      console.error('Error saving play history:', error);
    }
  }

  // 📊 GET VARIETY STATS
  static getVarietyStats(mood?: string, language?: string): {
    totalUniqueTracks: number;
    averagePlayCount: number;
    mostPlayedTrack: PlayHistory | null;
    recentVariety: number; // Percentage of unique tracks in last 10 plays
  } {
    let filteredHistory = this.playHistory;
    
    if (mood) filteredHistory = filteredHistory.filter(h => h.mood === mood);
    if (language) filteredHistory = filteredHistory.filter(h => h.language === language);

    const totalUniqueTracks = filteredHistory.length;
    const averagePlayCount = filteredHistory.length > 0 
      ? filteredHistory.reduce((sum, h) => sum + h.playCount, 0) / filteredHistory.length 
      : 0;
    
    const mostPlayedTrack = filteredHistory.reduce((max, h) => 
      h.playCount > (max?.playCount || 0) ? h : max, null as PlayHistory | null);

    // Calculate recent variety (last 10 plays)
    const recentPlays = filteredHistory
      .sort((a, b) => b.lastPlayed - a.lastPlayed)
      .slice(0, 10);
    const recentVariety = recentPlays.length > 0 
      ? (new Set(recentPlays.map(h => h.trackId)).size / recentPlays.length) * 100 
      : 0;

    return {
      totalUniqueTracks,
      averagePlayCount,
      mostPlayedTrack,
      recentVariety
    };
  }

  // 🎲 FORCE VARIETY MODE (for testing)
  static setVarietyMode(enabled: boolean): void {
    if (enabled) {
      this.DEFAULT_CONFIG.varietyBonus = 100;
      this.DEFAULT_CONFIG.minTimeBetweenReplays = 24 * 60; // 24 hours
      console.log('🎲 HIGH VARIETY MODE ENABLED');
    } else {
      this.DEFAULT_CONFIG.varietyBonus = 50;
      this.DEFAULT_CONFIG.minTimeBetweenReplays = 4 * 60; // 4 hours
      console.log('🎲 NORMAL VARIETY MODE');
    }
  }

  // 🔄 RESET HISTORY (for testing)
  static async resetHistory(): Promise<void> {
    this.playHistory = [];
    await this.saveHistory();
    console.log('🔄 Play history reset');
  }
}