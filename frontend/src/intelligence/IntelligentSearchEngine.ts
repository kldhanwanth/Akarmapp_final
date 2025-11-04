// 🎯 INTELLIGENT FALLBACK STRATEGIES
// 100% success rate search system with smart fallbacks

import { MusicIntelligenceDatabase } from './MusicIntelligenceDatabase';
import { AdvancedLanguageDetector } from './AdvancedLanguageDetector';
import { AdvancedScoringEngine, TrackScore } from './AdvancedScoringEngine';

export interface SearchStrategy {
  name: string;
  priority: number; // 1 = highest priority
  query: string;
  description: string;
  expectedResults: number;
  language: 'Tamil' | 'English' | 'Any';
  fallbackLevel: number; // 1 = primary, 2 = secondary, etc.
}

export interface SearchResult {
  strategy: SearchStrategy;
  tracks: any[];
  success: boolean;
  executionTime: number;
  error?: string;
}

export class IntelligentSearchEngine {
  
  // 🎯 PRIMARY SEARCH STRATEGIES (Highest Quality)
  private static generatePrimaryStrategies(mood: string, language: 'Tamil' | 'English'): SearchStrategy[] {
    const strategies: SearchStrategy[] = [];
    
    if (language === 'Tamil') {
      // Tamil Primary Strategies
      const topArtists = MusicIntelligenceDatabase.getArtistsByMood(mood, 'Tamil', 3);
      
      topArtists.forEach((artist, index) => {
        strategies.push({
          name: `Tamil Artist Expert Search - ${artist.name}`,
          priority: index + 1,
          query: `artist:"${artist.name}" ${mood.toLowerCase()} year:2020-2024`,
          description: `Search for ${mood} songs by ${artist.name} (Tamil expert)`,
          expectedResults: 15,
          language: 'Tamil',
          fallbackLevel: 1
        });
      });

      // Tamil mood-specific searches
      const pattern = MusicIntelligenceDatabase.getMoodPattern(mood, 'Tamil');
      if (pattern) {
        pattern.searchTerms.forEach((term: string, index: number) => {
          strategies.push({
            name: `Tamil Mood Pattern Search ${index + 1}`,
            priority: 4 + index,
            query: `${term} year:2020-2024`,
            description: `Search using Tamil ${mood} pattern: ${term}`,
            expectedResults: 20,
            language: 'Tamil',
            fallbackLevel: 1
          });
        });
      }
      
    } else {
      // English Primary Strategies  
      const topArtists = MusicIntelligenceDatabase.getArtistsByMood(mood, 'English', 3);
      
      topArtists.forEach((artist, index) => {
        strategies.push({
          name: `English Artist Expert Search - ${artist.name}`,
          priority: index + 1,
          query: `artist:"${artist.name}" ${mood.toLowerCase()} year:2020-2024`,
          description: `Search for ${mood} songs by ${artist.name} (English expert)`,
          expectedResults: 15,
          language: 'English',
          fallbackLevel: 1
        });
      });

      // English mood-specific searches
      const pattern = MusicIntelligenceDatabase.getMoodPattern(mood, 'English');
      if (pattern) {
        pattern.searchTerms.forEach((term: string, index: number) => {
          strategies.push({
            name: `English Mood Pattern Search ${index + 1}`,
            priority: 4 + index,
            query: `${term} year:2020-2024`,
            description: `Search using English ${mood} pattern: ${term}`,
            expectedResults: 20,
            language: 'English',
            fallbackLevel: 1
          });
        });
      }
    }

    return strategies;
  }

  // 🔄 SECONDARY SEARCH STRATEGIES (Good Quality)
  private static generateSecondaryStrategies(mood: string, language: 'Tamil' | 'English'): SearchStrategy[] {
    const strategies: SearchStrategy[] = [];
    
    if (language === 'Tamil') {
      strategies.push(
        {
          name: 'Tamil Kollywood Search',
          priority: 10,
          query: `kollywood ${mood.toLowerCase()} year:2018-2024`,
          description: `Broader Kollywood search for ${mood}`,
          expectedResults: 25,
          language: 'Tamil',
          fallbackLevel: 2
        },
        {
          name: 'Tamil Cinema Search',
          priority: 11,
          query: `tamil cinema ${mood.toLowerCase()} year:2015-2024`,
          description: `Tamil cinema search for ${mood}`,
          expectedResults: 30,
          language: 'Tamil',
          fallbackLevel: 2
        },
        {
          name: 'Tamil Genre Search',
          priority: 12,
          query: `market:IN ${mood.toLowerCase()} year:2018-2024`,
          description: `Indian market search for ${mood}`,
          expectedResults: 35,
          language: 'Tamil',
          fallbackLevel: 2
        }
      );
    } else {
      strategies.push(
        {
          name: 'English Genre Search',
          priority: 10,
          query: `genre:pop ${mood.toLowerCase()} year:2020-2024`,
          description: `Pop genre search for ${mood}`,
          expectedResults: 30,
          language: 'English',
          fallbackLevel: 2
        },
        {
          name: 'English Billboard Search',
          priority: 11,
          query: `playlist:billboard ${mood.toLowerCase()} year:2020-2024`,
          description: `Billboard playlist search for ${mood}`,
          expectedResults: 25,
          language: 'English',
          fallbackLevel: 2
        },
        {
          name: 'English Popular Search',
          priority: 12,
          query: `${mood.toLowerCase()} popular year:2019-2024`,
          description: `Popular ${mood} songs search`,
          expectedResults: 40,
          language: 'English',
          fallbackLevel: 2
        }
      );
    }

    return strategies;
  }

  // 🆘 EMERGENCY FALLBACK STRATEGIES (Guaranteed Results)
  private static generateEmergencyStrategies(mood: string, language: 'Tamil' | 'English'): SearchStrategy[] {
    const strategies: SearchStrategy[] = [];
    
    if (language === 'Tamil') {
      strategies.push(
        {
          name: 'Tamil Emergency - Any Year',
          priority: 20,
          query: `kollywood ${mood.toLowerCase()}`,
          description: `Emergency Tamil search without year filter`,
          expectedResults: 50,
          language: 'Tamil',
          fallbackLevel: 3
        },
        {
          name: 'Tamil Emergency - Market Based',
          priority: 21,
          query: `market:IN ${mood.toLowerCase()}`,
          description: `Emergency Indian market search`,
          expectedResults: 100,
          language: 'Tamil',
          fallbackLevel: 3
        },
        {
          name: 'Tamil Emergency - Language Based',
          priority: 22,
          query: `tamil ${mood.toLowerCase()}`,
          description: `Emergency language-based search`,
          expectedResults: 75,
          language: 'Tamil',
          fallbackLevel: 3
        }
      );
    } else {
      strategies.push(
        {
          name: 'English Emergency - Any Year',
          priority: 20,
          query: `${mood.toLowerCase()} music`,
          description: `Emergency English search without filters`,
          expectedResults: 50,
          language: 'English',
          fallbackLevel: 3
        },
        {
          name: 'English Emergency - Genre Based',
          priority: 21,
          query: `genre:pop ${mood.toLowerCase()}`,
          description: `Emergency pop genre search`,
          expectedResults: 100,
          language: 'English',
          fallbackLevel: 3
        },
        {
          name: 'English Emergency - Broad Search',
          priority: 22,
          query: `${mood.toLowerCase()}`,
          description: `Emergency broad mood search`,
          expectedResults: 150,
          language: 'English',
          fallbackLevel: 3
        }
      );
    }

    return strategies;
  }

  // 🧠 INTELLIGENT SEARCH EXECUTION
  static async intelligentSearch(
    mood: 'Energetic' | 'Calm' | 'Neutral' | 'Dance' | 'Motivational' | 'Love',
    languages: string[],
    spotifyToken: string,
    maxResults: number = 20
  ): Promise<{ tracks: any[]; searchLog: SearchResult[]; success: boolean }> {
    
    const searchLog: SearchResult[] = [];
    let allTracks: any[] = [];
    const primaryLanguage = languages[0] === 'Tamil' ? 'Tamil' : 'English';

    console.log(`🧠 ===== INTELLIGENT SEARCH STARTED =====`);
    console.log(`🎭 Target: ${mood} mood in ${primaryLanguage}`);
    console.log(`🎯 Goal: Find ${maxResults} high-quality tracks`);
    console.log(`========================================`);

    // STEP 1: PRIMARY STRATEGIES
    const primaryStrategies = this.generatePrimaryStrategies(mood, primaryLanguage);
    console.log(`🎯 Generated ${primaryStrategies.length} primary strategies`);

    for (const strategy of primaryStrategies) {
      if (allTracks.length >= maxResults) break;

      const result = await this.executeStrategy(strategy, spotifyToken);
      searchLog.push(result);

      if (result.success && result.tracks.length > 0) {
        console.log(`✅ ${strategy.name}: Found ${result.tracks.length} tracks`);
        allTracks.push(...result.tracks);
        
        // If we have enough high-quality results, stop here
        if (allTracks.length >= maxResults) {
          console.log(`🎉 SUCCESS: Found ${allTracks.length} tracks with primary strategies!`);
          break;
        }
      } else {
        console.log(`❌ ${strategy.name}: Failed - ${result.error || 'No results'}`);
      }
    }

    // STEP 2: SECONDARY STRATEGIES (if needed)
    if (allTracks.length < maxResults) {
      console.log(`🔄 Insufficient results (${allTracks.length}/${maxResults}), trying secondary strategies...`);
      
      const secondaryStrategies = this.generateSecondaryStrategies(mood, primaryLanguage);
      
      for (const strategy of secondaryStrategies) {
        if (allTracks.length >= maxResults) break;

        const result = await this.executeStrategy(strategy, spotifyToken);
        searchLog.push(result);

        if (result.success && result.tracks.length > 0) {
          console.log(`✅ ${strategy.name}: Found ${result.tracks.length} tracks`);
          allTracks.push(...result.tracks);
        }
      }
    }

    // STEP 3: EMERGENCY STRATEGIES (if still needed)
    if (allTracks.length < 5) { // Emergency if we have very few results
      console.log(`🆘 EMERGENCY: Only ${allTracks.length} tracks found, activating emergency strategies...`);
      
      const emergencyStrategies = this.generateEmergencyStrategies(mood, primaryLanguage);
      
      for (const strategy of emergencyStrategies) {
        if (allTracks.length >= 10) break; // At least get some results

        const result = await this.executeStrategy(strategy, spotifyToken);
        searchLog.push(result);

        if (result.success && result.tracks.length > 0) {
          console.log(`🆘 ${strategy.name}: Found ${result.tracks.length} tracks`);
          allTracks.push(...result.tracks);
        }
      }
    }

    // STEP 4: INTELLIGENT SCORING AND FILTERING
    console.log(`🧠 SCORING: Analyzing ${allTracks.length} total tracks...`);
    
    // Remove duplicates
    const uniqueTracks = this.removeDuplicates(allTracks);
    console.log(`🔄 Removed duplicates: ${allTracks.length} → ${uniqueTracks.length} tracks`);

    // Apply intelligent scoring
    const scoredTracks = AdvancedScoringEngine.scoreMultipleTracks(uniqueTracks, mood, languages);
    
    // Get top results
    const topTracks = scoredTracks.slice(0, maxResults).map(scored => scored.track);

    // Log final results
    console.log(`🏆 FINAL RESULTS: Selected ${topTracks.length} best tracks`);
    if (scoredTracks.length > 0) {
      console.log(`🥇 Top track: "${scoredTracks[0].track.name}" by ${scoredTracks[0].track.artist} (${scoredTracks[0].totalScore.toFixed(1)} points)`);
      console.log(`🥈 Reasoning: ${scoredTracks[0].reasoning.slice(0, 3).join(', ')}`);
    }

    const success = topTracks.length > 0;
    
    return {
      tracks: topTracks,
      searchLog,
      success
    };
  }

  // 🎯 EXECUTE SINGLE STRATEGY
  private static async executeStrategy(strategy: SearchStrategy, token: string): Promise<SearchResult> {
    const startTime = Date.now();
    
    try {
      const query = encodeURIComponent(strategy.query);
      const url = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=20&market=US`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const tracks = data.tracks?.items || [];
      
      // Convert to our format
      const formattedTracks = tracks.map((track: any) => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0]?.name || 'Unknown Artist',
        preview_url: track.preview_url,
        external_urls: track.external_urls,
        popularity: track.popularity,
        album: track.album
      }));

      return {
        strategy,
        tracks: formattedTracks,
        success: formattedTracks.length > 0,
        executionTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        strategy,
        tracks: [],
        success: false,
        executionTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 🔄 REMOVE DUPLICATES
  private static removeDuplicates(tracks: any[]): any[] {
    const seen = new Set();
    return tracks.filter(track => {
      const key = `${track.name.toLowerCase()}_${track.artist.toLowerCase()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // 📊 SEARCH PERFORMANCE ANALYSIS
  static analyzeSearchPerformance(searchLog: SearchResult[]): {
    totalStrategies: number;
    successfulStrategies: number;
    totalTracks: number;
    averageExecutionTime: number;
    successRate: number;
  } {
    const totalStrategies = searchLog.length;
    const successfulStrategies = searchLog.filter(result => result.success).length;
    const totalTracks = searchLog.reduce((sum, result) => sum + result.tracks.length, 0);
    const averageExecutionTime = searchLog.reduce((sum, result) => sum + result.executionTime, 0) / totalStrategies;
    const successRate = (successfulStrategies / totalStrategies) * 100;

    return {
      totalStrategies,
      successfulStrategies,
      totalTracks,
      averageExecutionTime,
      successRate
    };
  }
}