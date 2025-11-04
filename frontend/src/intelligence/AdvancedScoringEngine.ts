// 🧠 ADVANCED MULTI-DIMENSIONAL SCORING SYSTEM
// Neural network-level intelligence for perfect song matching

import { MusicIntelligenceDatabase, ArtistProfile } from './MusicIntelligenceDatabase';
import { AdvancedLanguageDetector, LanguageScore } from './AdvancedLanguageDetector';

export interface TrackScore {
  track: any;
  totalScore: number;
  breakdown: {
    languageMatch: number;
    moodRelevance: number;
    artistAuthority: number;
    popularityFactor: number;
    recencyBonus: number;
    culturalAlignment: number;
    userPreference: number;
    acousticMatch: number;
    trendingFactor: number;
    contextualBonus: number;
  };
  confidence: number;
  reasoning: string[];
}

export interface UserProfile {
  topArtists: string[];
  topTracks: string[];
  languagePreference: { [language: string]: number };
  moodHistory: { [mood: string]: number };
  genrePreference: { [genre: string]: number };
  recentSelections: Array<{ track: string; artist: string; timestamp: number; rating?: number }>;
  culturalContext: 'Tamil' | 'English' | 'Mixed';
}

export class AdvancedScoringEngine {
  
  // 🎯 SCORING WEIGHTS (totals to 100%)
  private static readonly WEIGHTS = {
    languageMatch: 0.35,      // 35% - Most important for accuracy
    moodRelevance: 0.20,      // 20% - Core functionality
    artistAuthority: 0.15,    // 15% - Artist reputation for mood
    popularityFactor: 0.10,   // 10% - General appeal
    recencyBonus: 0.05,       // 5% - Fresh content
    culturalAlignment: 0.05,  // 5% - Cultural context
    userPreference: 0.05,     // 5% - Personalization
    acousticMatch: 0.03,      // 3% - Audio features
    trendingFactor: 0.01,     // 1% - Current trends
    contextualBonus: 0.01     // 1% - Time/context factors
  };

  // 🧠 MAIN SCORING ALGORITHM
  static scoreTrack(
    track: any, 
    mood: string, 
    languages: string[], 
    userProfile?: UserProfile
  ): TrackScore {
    
    const breakdown = {
      languageMatch: 0,
      moodRelevance: 0,
      artistAuthority: 0,
      popularityFactor: 0,
      recencyBonus: 0,
      culturalAlignment: 0,
      userPreference: 0,
      acousticMatch: 0,
      trendingFactor: 0,
      contextualBonus: 0
    };
    
    const reasoning: string[] = [];

    // 1. LANGUAGE MATCH ANALYSIS (0-100 points)
    const languageAnalysis = this.analyzeLanguageMatch(track, languages);
    breakdown.languageMatch = languageAnalysis.score;
    reasoning.push(...languageAnalysis.reasons);

    // 2. MOOD RELEVANCE ANALYSIS (0-100 points)
    const moodAnalysis = this.analyzeMoodRelevance(track, mood);
    breakdown.moodRelevance = moodAnalysis.score;
    reasoning.push(...moodAnalysis.reasons);

    // 3. ARTIST AUTHORITY ANALYSIS (0-100 points)
    const artistAnalysis = this.analyzeArtistAuthority(track, mood, languages);
    breakdown.artistAuthority = artistAnalysis.score;
    reasoning.push(...artistAnalysis.reasons);

    // 4. POPULARITY FACTOR (0-100 points)
    const popularityAnalysis = this.analyzePopularity(track);
    breakdown.popularityFactor = popularityAnalysis.score;
    reasoning.push(...popularityAnalysis.reasons);

    // 5. RECENCY BONUS (0-100 points)
    const recencyAnalysis = this.analyzeRecency(track);
    breakdown.recencyBonus = recencyAnalysis.score;
    reasoning.push(...recencyAnalysis.reasons);

    // 6. CULTURAL ALIGNMENT (0-100 points)
    const culturalAnalysis = this.analyzeCulturalAlignment(track, languages, userProfile);
    breakdown.culturalAlignment = culturalAnalysis.score;
    reasoning.push(...culturalAnalysis.reasons);

    // 7. USER PREFERENCE (0-100 points)
    const userAnalysis = this.analyzeUserPreference(track, userProfile);
    breakdown.userPreference = userAnalysis.score;
    reasoning.push(...userAnalysis.reasons);

    // 8. ACOUSTIC MATCH (0-100 points)
    const acousticAnalysis = this.analyzeAcousticMatch(track, mood);
    breakdown.acousticMatch = acousticAnalysis.score;
    reasoning.push(...acousticAnalysis.reasons);

    // 9. TRENDING FACTOR (0-100 points)
    const trendingAnalysis = this.analyzeTrendingFactor(track);
    breakdown.trendingFactor = trendingAnalysis.score;
    reasoning.push(...trendingAnalysis.reasons);

    // 10. CONTEXTUAL BONUS (0-100 points)
    const contextualAnalysis = this.analyzeContextualFactors(track, mood, languages);
    breakdown.contextualBonus = contextualAnalysis.score;
    reasoning.push(...contextualAnalysis.reasons);

    // CALCULATE WEIGHTED TOTAL SCORE
    const totalScore = 
      breakdown.languageMatch * this.WEIGHTS.languageMatch +
      breakdown.moodRelevance * this.WEIGHTS.moodRelevance +
      breakdown.artistAuthority * this.WEIGHTS.artistAuthority +
      breakdown.popularityFactor * this.WEIGHTS.popularityFactor +
      breakdown.recencyBonus * this.WEIGHTS.recencyBonus +
      breakdown.culturalAlignment * this.WEIGHTS.culturalAlignment +
      breakdown.userPreference * this.WEIGHTS.userPreference +
      breakdown.acousticMatch * this.WEIGHTS.acousticMatch +
      breakdown.trendingFactor * this.WEIGHTS.trendingFactor +
      breakdown.contextualBonus * this.WEIGHTS.contextualBonus;

    // CONFIDENCE CALCULATION
    const confidence = this.calculateConfidence(breakdown, languageAnalysis.confidence);

    return {
      track,
      totalScore,
      breakdown,
      confidence,
      reasoning
    };
  }

  // 🎯 LANGUAGE MATCH ANALYSIS
  private static analyzeLanguageMatch(track: any, languages: string[]): { score: number; reasons: string[]; confidence: number } {
    const reasons: string[] = [];
    let score = 0;
    let confidence = 0;

    const primaryLanguage = languages[0] || 'English';
    const detectionResults = AdvancedLanguageDetector.detectLanguage(track.name, track.artist);
    
    for (const result of detectionResults) {
      if (languages.includes(result.language)) {
        score = result.confidence;
        confidence = result.confidence;
        reasons.push(`Language match: ${result.language} (${result.confidence}% confidence)`);
        
        if (result.confidence >= 90) {
          reasons.push(`🎯 PERFECT ${result.language.toUpperCase()} MATCH! Ultra high confidence`);
        } else if (result.confidence >= 70) {
          reasons.push(`✅ Strong ${result.language} match with good confidence`);
        } else if (result.confidence >= 50) {
          reasons.push(`⚠️ Moderate ${result.language} match - some uncertainty`);
        } else {
          score = Math.max(0, score - 30); // Penalty for low confidence
          reasons.push(`❌ Weak ${result.language} match - significant doubt`);
        }
        break;
      }
    }

    // PENALTY for wrong language
    if (score < 50 && primaryLanguage === 'Tamil') {
      score = Math.max(0, score - 40);
      reasons.push(`❌ LANGUAGE MISMATCH: Not ${primaryLanguage} (-40 points)`);
    }

    return { score, reasons, confidence };
  }

  // 🎭 MOOD RELEVANCE ANALYSIS
  private static analyzeMoodRelevance(track: any, mood: string): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 50; // Base score

    const trackText = `${track.name} ${track.artist}`.toLowerCase();
    
    // Get mood-specific keywords from database
    const moodPatterns = MusicIntelligenceDatabase.MOOD_PATTERNS[mood as keyof typeof MusicIntelligenceDatabase.MOOD_PATTERNS];
    
    if (moodPatterns) {
      // Check Tamil patterns if available
      if (moodPatterns.Tamil) {
        const tamilKeywords = moodPatterns.Tamil.keywords.filter(keyword => trackText.includes(keyword));
        if (tamilKeywords.length > 0) {
          score += tamilKeywords.length * 15;
          reasons.push(`Tamil mood keywords: ${tamilKeywords.join(', ')} (+${tamilKeywords.length * 15})`);
        }
      }
      
      // Check English patterns if available
      if (moodPatterns.English) {
        const englishKeywords = moodPatterns.English.keywords.filter(keyword => trackText.includes(keyword));
        if (englishKeywords.length > 0) {
          score += englishKeywords.length * 12;
          reasons.push(`English mood keywords: ${englishKeywords.join(', ')} (+${englishKeywords.length * 12})`);
        }
      }
    }

    // Mood-specific analysis
    switch (mood) {
      case 'Dance':
        if (trackText.includes('dance') || trackText.includes('party') || trackText.includes('club')) {
          score += 20;
          reasons.push('Strong dance indicators (+20)');
        }
        break;
      case 'Love':
        if (trackText.includes('love') || trackText.includes('heart') || trackText.includes('kadhal')) {
          score += 20;
          reasons.push('Strong love indicators (+20)');
        }
        break;
      case 'Energetic':
        if (trackText.includes('energy') || trackText.includes('power') || trackText.includes('high')) {
          score += 20;
          reasons.push('Strong energy indicators (+20)');
        }
        break;
    }

    return { score: Math.min(100, score), reasons };
  }

  // 🎨 ARTIST AUTHORITY ANALYSIS
  private static analyzeArtistAuthority(track: any, mood: string, languages: string[]): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 30; // Base score

    const primaryLanguage = languages[0] === 'Tamil' ? 'Tamil' : 'English';
    
    // Get artist from database
    const artists = primaryLanguage === 'Tamil' ? 
      MusicIntelligenceDatabase.TAMIL_ARTISTS : 
      MusicIntelligenceDatabase.ENGLISH_ARTISTS;
    
    const artistProfile = artists.find(artist => 
      artist.name.toLowerCase() === track.artist.toLowerCase() ||
      artist.aliases.some(alias => alias.toLowerCase() === track.artist.toLowerCase())
    );

    if (artistProfile) {
      // Artist found in database
      const moodStrength = artistProfile.moodStrength[mood] || 0;
      score += moodStrength * 0.7; // Convert to 0-70 scale
      
      reasons.push(`Known ${primaryLanguage} artist: ${artistProfile.name}`);
      reasons.push(`Mood expertise (${mood}): ${moodStrength}/100 (+${Math.round(moodStrength * 0.7)})`);
      
      // Bonus for high authority artists
      if (artistProfile.popularity >= 90) {
        score += 15;
        reasons.push(`Legendary artist bonus (+15)`);
      } else if (artistProfile.popularity >= 80) {
        score += 10;
        reasons.push(`Popular artist bonus (+10)`);
      }
      
    } else {
      // Unknown artist - try to infer
      const artistScore = MusicIntelligenceDatabase.scoreArtistForMood(track.artist, mood, primaryLanguage);
      if (artistScore > 0) {
        score += artistScore * 0.3;
        reasons.push(`Inferred artist score: ${artistScore.toFixed(1)} (+${Math.round(artistScore * 0.3)})`);
      } else {
        reasons.push(`Unknown artist - default scoring`);
      }
    }

    return { score: Math.min(100, score), reasons };
  }

  // 📈 POPULARITY ANALYSIS
  private static analyzePopularity(track: any): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    const popularity = track.popularity || 50;
    
    reasons.push(`Spotify popularity: ${popularity}/100`);
    
    let score = popularity;
    
    if (popularity >= 80) {
      reasons.push(`🔥 Viral hit status (+bonus)`);
      score += 10;
    } else if (popularity >= 60) {
      reasons.push(`✅ Popular track (+bonus)`);
      score += 5;
    } else if (popularity < 30) {
      reasons.push(`⚠️ Low popularity (-penalty)`);
      score -= 10;
    }

    return { score: Math.max(0, Math.min(100, score)), reasons };
  }

  // 📅 RECENCY ANALYSIS
  private static analyzeRecency(track: any): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 50; // Base score
    
    const currentYear = new Date().getFullYear();
    const releaseDate = track.album?.release_date;
    
    if (releaseDate) {
      const releaseYear = new Date(releaseDate).getFullYear();
      const yearDiff = currentYear - releaseYear;
      
      if (yearDiff === 0) {
        score = 100;
        reasons.push(`🆕 Brand new release! ${currentYear} (+50)`);
      } else if (yearDiff === 1) {
        score = 85;
        reasons.push(`Recent release: ${releaseYear} (+35)`);
      } else if (yearDiff <= 3) {
        score = 70;
        reasons.push(`Modern release: ${releaseYear} (+20)`);
      } else if (yearDiff <= 5) {
        score = 60;
        reasons.push(`Recent classic: ${releaseYear} (+10)`);
      } else {
        score = 40;
        reasons.push(`Older track: ${releaseYear} (-10)`);
      }
    } else {
      reasons.push(`Unknown release date - default scoring`);
    }

    return { score, reasons };
  }

  // 🌍 CULTURAL ALIGNMENT (simplified for now)
  private static analyzeCulturalAlignment(track: any, languages: string[], userProfile?: UserProfile): { score: number; reasons: string[] } {
    return { score: 50, reasons: ['Cultural analysis - default scoring'] };
  }

  // 👤 USER PREFERENCE (simplified for now)  
  private static analyzeUserPreference(track: any, userProfile?: UserProfile): { score: number; reasons: string[] } {
    return { score: 50, reasons: ['User preference - default scoring'] };
  }

  // 🎵 ACOUSTIC MATCH (simplified for now)
  private static analyzeAcousticMatch(track: any, mood: string): { score: number; reasons: string[] } {
    return { score: 50, reasons: ['Acoustic analysis - default scoring'] };
  }

  // 📊 TRENDING FACTOR (simplified for now)
  private static analyzeTrendingFactor(track: any): { score: number; reasons: string[] } {
    return { score: 50, reasons: ['Trending analysis - default scoring'] };
  }

  // 🎯 CONTEXTUAL FACTORS (simplified for now)
  private static analyzeContextualFactors(track: any, mood: string, languages: string[]): { score: number; reasons: string[] } {
    return { score: 50, reasons: ['Contextual analysis - default scoring'] };
  }

  // 🎯 CONFIDENCE CALCULATION
  private static calculateConfidence(breakdown: any, languageConfidence: number): number {
    // Primary confidence based on language detection
    let confidence = languageConfidence * 0.4;
    
    // Add confidence from other strong indicators
    if (breakdown.artistAuthority > 70) confidence += 20;
    if (breakdown.moodRelevance > 70) confidence += 20;
    if (breakdown.popularityFactor > 60) confidence += 10;
    if (breakdown.recencyBonus > 70) confidence += 10;
    
    return Math.min(100, confidence);
  }

  // 🏆 BATCH SCORING
  static scoreMultipleTracks(
    tracks: any[], 
    mood: string, 
    languages: string[], 
    userProfile?: UserProfile
  ): TrackScore[] {
    return tracks
      .map(track => this.scoreTrack(track, mood, languages, userProfile))
      .sort((a, b) => b.totalScore - a.totalScore);
  }
}