// 🧠 REAL-TIME LEARNING SYSTEM
// AI that learns from user behavior and gets smarter with each interaction

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserInteraction {
  timestamp: number;
  action: 'play' | 'skip' | 'like' | 'dislike' | 'replay';
  track: {
    id: string;
    name: string;
    artist: string;
    language: 'Tamil' | 'English';
  };
  context: {
    mood: string;
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    dayOfWeek: string;
    selectedLanguages: string[];
  };
  userFeedback?: {
    rating: 1 | 2 | 3 | 4 | 5;
    comment?: string;
  };
}

export interface LearningModel {
  artistPreferences: { [artist: string]: { score: number; interactions: number; lastUpdated: number } };
  moodPatterns: { [mood: string]: { success: number; total: number; avgRating: number } };
  languagePreferences: { [language: string]: { preference: number; accuracy: number } };
  timePatterns: { [timeOfDay: string]: { preferredMoods: string[]; avgSuccess: number } };
  genrePreferences: { [genre: string]: { score: number; confidence: number } };
  contextualLearning: {
    dayOfWeekPatterns: { [day: string]: { preferredMoods: string[]; success: number } };
    seasonalPreferences: { [season: string]: { artists: string[]; moods: string[] } };
  };
  globalStats: {
    totalInteractions: number;
    successRate: number;
    avgRating: number;
    lastUpdated: number;
  };
}

export class RealTimeLearningSystem {
  private static readonly STORAGE_KEY = 'music_intelligence_learning';
  private static learningModel: LearningModel | null = null;

  // 🚀 INITIALIZE LEARNING SYSTEM
  static async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.learningModel = JSON.parse(stored);
        console.log('🧠 Learning model loaded from storage');
        console.log(`📊 Stats: ${this.learningModel?.globalStats.totalInteractions} interactions, ${this.learningModel?.globalStats.successRate.toFixed(1)}% success rate`);
      } else {
        this.learningModel = this.createEmptyModel();
        await this.saveLearningModel();
        console.log('🆕 New learning model created');
      }
    } catch (error) {
      console.error('Error initializing learning system:', error);
      this.learningModel = this.createEmptyModel();
    }
  }

  // 📝 RECORD USER INTERACTION
  static async recordInteraction(interaction: UserInteraction): Promise<void> {
    if (!this.learningModel) await this.initialize();
    
    const model = this.learningModel!;
    
    console.log(`🧠 LEARNING: Recording ${interaction.action} for "${interaction.track.name}" by ${interaction.track.artist}`);

    // 1. UPDATE ARTIST PREFERENCES
    this.updateArtistPreferences(model, interaction);
    
    // 2. UPDATE MOOD PATTERNS
    this.updateMoodPatterns(model, interaction);
    
    // 3. UPDATE LANGUAGE PREFERENCES
    this.updateLanguagePreferences(model, interaction);
    
    // 4. UPDATE TIME PATTERNS
    this.updateTimePatterns(model, interaction);
    
    // 5. UPDATE CONTEXTUAL LEARNING
    this.updateContextualLearning(model, interaction);
    
    // 6. UPDATE GLOBAL STATS
    this.updateGlobalStats(model, interaction);

    // Save updated model
    await this.saveLearningModel();
    
    console.log(`📊 Learning updated: ${model.globalStats.totalInteractions} total interactions`);
  }

  // 🎨 UPDATE ARTIST PREFERENCES
  private static updateArtistPreferences(model: LearningModel, interaction: UserInteraction): void {
    const artist = interaction.track.artist.toLowerCase();
    
    if (!model.artistPreferences[artist]) {
      model.artistPreferences[artist] = { score: 50, interactions: 0, lastUpdated: Date.now() };
    }
    
    const artistData = model.artistPreferences[artist];
    artistData.interactions++;
    artistData.lastUpdated = Date.now();
    
    // Adjust score based on action
    switch (interaction.action) {
      case 'like':
        artistData.score = Math.min(100, artistData.score + 15);
        break;
      case 'play':
        artistData.score = Math.min(100, artistData.score + 5);
        break;
      case 'replay':
        artistData.score = Math.min(100, artistData.score + 10);
        break;
      case 'skip':
        artistData.score = Math.max(0, artistData.score - 8);
        break;
      case 'dislike':
        artistData.score = Math.max(0, artistData.score - 20);
        break;
    }
    
    // Apply user rating if available
    if (interaction.userFeedback?.rating) {
      const ratingImpact = (interaction.userFeedback.rating - 3) * 10; // -20 to +20
      artistData.score = Math.max(0, Math.min(100, artistData.score + ratingImpact));
    }

    console.log(`🎨 Artist learning: ${interaction.track.artist} score: ${artistData.score.toFixed(1)}`);
  }

  // 🎭 UPDATE MOOD PATTERNS
  private static updateMoodPatterns(model: LearningModel, interaction: UserInteraction): void {
    const mood = interaction.context.mood;
    
    if (!model.moodPatterns[mood]) {
      model.moodPatterns[mood] = { success: 0, total: 0, avgRating: 3 };
    }
    
    const moodData = model.moodPatterns[mood];
    moodData.total++;
    
    // Determine if this was a success
    const isSuccess = ['play', 'like', 'replay'].includes(interaction.action);
    if (isSuccess) moodData.success++;
    
    // Update average rating
    if (interaction.userFeedback?.rating) {
      moodData.avgRating = (moodData.avgRating + interaction.userFeedback.rating) / 2;
    }

    const successRate = (moodData.success / moodData.total) * 100;
    console.log(`🎭 Mood learning: ${mood} success rate: ${successRate.toFixed(1)}%`);
  }

  // 🌍 UPDATE LANGUAGE PREFERENCES
  private static updateLanguagePreferences(model: LearningModel, interaction: UserInteraction): void {
    const language = interaction.track.language;
    
    if (!model.languagePreferences[language]) {
      model.languagePreferences[language] = { preference: 50, accuracy: 50 };
    }
    
    const langData = model.languagePreferences[language];
    
    // Update preference based on action
    switch (interaction.action) {
      case 'like':
      case 'replay':
        langData.preference = Math.min(100, langData.preference + 10);
        break;
      case 'play':
        langData.preference = Math.min(100, langData.preference + 3);
        break;
      case 'skip':
        langData.preference = Math.max(0, langData.preference - 5);
        break;
      case 'dislike':
        langData.preference = Math.max(0, langData.preference - 15);
        break;
    }

    console.log(`🌍 Language learning: ${language} preference: ${langData.preference.toFixed(1)}`);
  }

  // ⏰ UPDATE TIME PATTERNS
  private static updateTimePatterns(model: LearningModel, interaction: UserInteraction): void {
    const timeOfDay = interaction.context.timeOfDay;
    const mood = interaction.context.mood;
    
    if (!model.timePatterns[timeOfDay]) {
      model.timePatterns[timeOfDay] = { preferredMoods: [], avgSuccess: 50 };
    }
    
    const timeData = model.timePatterns[timeOfDay];
    
    // Track mood preferences for this time
    if (['like', 'replay'].includes(interaction.action)) {
      if (!timeData.preferredMoods.includes(mood)) {
        timeData.preferredMoods.push(mood);
      }
    }

    console.log(`⏰ Time learning: ${timeOfDay} prefers: ${timeData.preferredMoods.join(', ')}`);
  }

  // 🎯 UPDATE CONTEXTUAL LEARNING
  private static updateContextualLearning(model: LearningModel, interaction: UserInteraction): void {
    const dayOfWeek = interaction.context.dayOfWeek;
    const mood = interaction.context.mood;
    
    // Day of week patterns
    if (!model.contextualLearning.dayOfWeekPatterns[dayOfWeek]) {
      model.contextualLearning.dayOfWeekPatterns[dayOfWeek] = { preferredMoods: [], success: 50 };
    }
    
    const dayData = model.contextualLearning.dayOfWeekPatterns[dayOfWeek];
    
    if (['like', 'replay'].includes(interaction.action)) {
      if (!dayData.preferredMoods.includes(mood)) {
        dayData.preferredMoods.push(mood);
      }
    }
  }

  // 📊 UPDATE GLOBAL STATS
  private static updateGlobalStats(model: LearningModel, interaction: UserInteraction): void {
    model.globalStats.totalInteractions++;
    model.globalStats.lastUpdated = Date.now();
    
    // Calculate overall success rate
    const allMoods = Object.values(model.moodPatterns);
    if (allMoods.length > 0) {
      const totalSuccess = allMoods.reduce((sum, mood) => sum + mood.success, 0);
      const totalAttempts = allMoods.reduce((sum, mood) => sum + mood.total, 0);
      model.globalStats.successRate = totalAttempts > 0 ? (totalSuccess / totalAttempts) * 100 : 0;
    }
    
    // Update average rating
    if (interaction.userFeedback?.rating) {
      model.globalStats.avgRating = (model.globalStats.avgRating + interaction.userFeedback.rating) / 2;
    }
  }

  // 🎯 GET INTELLIGENT RECOMMENDATIONS
  static getIntelligentRecommendations(
    mood: string,
    language: 'Tamil' | 'English',
    context: { timeOfDay: string; dayOfWeek: string }
  ): {
    recommendedArtists: string[];
    confidenceScore: number;
    reasoning: string[];
  } {
    if (!this.learningModel) {
      return { recommendedArtists: [], confidenceScore: 0, reasoning: ['Learning model not initialized'] };
    }

    const model = this.learningModel;
    const reasoning: string[] = [];
    
    // Get top artists for this language
    const languageArtists = Object.entries(model.artistPreferences)
      .filter(([artist, data]) => data.interactions >= 2) // Only consider artists with enough data
      .sort(([, a], [, b]) => b.score - a.score)
      .slice(0, 10)
      .map(([artist]) => artist);

    // Check time-based preferences
    const timePreferences = model.timePatterns[context.timeOfDay];
    if (timePreferences && timePreferences.preferredMoods.includes(mood)) {
      reasoning.push(`Time pattern: ${mood} preferred during ${context.timeOfDay}`);
    }

    // Check day-based preferences
    const dayPreferences = model.contextualLearning.dayOfWeekPatterns[context.dayOfWeek];
    if (dayPreferences && dayPreferences.preferredMoods.includes(mood)) {
      reasoning.push(`Day pattern: ${mood} preferred on ${context.dayOfWeek}`);
    }

    // Calculate confidence based on data availability
    const totalInteractions = model.globalStats.totalInteractions;
    const moodData = model.moodPatterns[mood];
    const confidenceScore = Math.min(100, 
      (totalInteractions * 2) + // Base confidence from total interactions
      (moodData ? moodData.total * 10 : 0) + // Mood-specific confidence
      (languageArtists.length * 5) // Artist preference confidence
    );

    return {
      recommendedArtists: languageArtists,
      confidenceScore,
      reasoning
    };
  }

  // 📈 GET LEARNING INSIGHTS
  static getLearningInsights(): {
    topArtists: Array<{ artist: string; score: number; interactions: number }>;
    moodSuccessRates: Array<{ mood: string; successRate: number; confidence: number }>;
    languagePreferences: Array<{ language: string; preference: number }>;
    globalStats: any;
  } {
    if (!this.learningModel) {
      return { topArtists: [], moodSuccessRates: [], languagePreferences: [], globalStats: {} };
    }

    const model = this.learningModel;

    // Top artists
    const topArtists = Object.entries(model.artistPreferences)
      .map(([artist, data]) => ({ artist, score: data.score, interactions: data.interactions }))
      .filter(item => item.interactions >= 2)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    // Mood success rates
    const moodSuccessRates = Object.entries(model.moodPatterns)
      .map(([mood, data]) => ({
        mood,
        successRate: data.total > 0 ? (data.success / data.total) * 100 : 0,
        confidence: Math.min(100, data.total * 10)
      }))
      .sort((a, b) => b.successRate - a.successRate);

    // Language preferences
    const languagePreferences = Object.entries(model.languagePreferences)
      .map(([language, data]) => ({ language, preference: data.preference }))
      .sort((a, b) => b.preference - a.preference);

    return {
      topArtists,
      moodSuccessRates,
      languagePreferences,
      globalStats: model.globalStats
    };
  }

  // 💾 SAVE LEARNING MODEL
  private static async saveLearningModel(): Promise<void> {
    try {
      if (this.learningModel) {
        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.learningModel));
      }
    } catch (error) {
      console.error('Error saving learning model:', error);
    }
  }

  // 🆕 CREATE EMPTY MODEL
  private static createEmptyModel(): LearningModel {
    return {
      artistPreferences: {},
      moodPatterns: {},
      languagePreferences: {},
      timePatterns: {},
      genrePreferences: {},
      contextualLearning: {
        dayOfWeekPatterns: {},
        seasonalPreferences: {}
      },
      globalStats: {
        totalInteractions: 0,
        successRate: 0,
        avgRating: 3,
        lastUpdated: Date.now()
      }
    };
  }

  // 🔄 RESET LEARNING MODEL (for testing)
  static async resetLearningModel(): Promise<void> {
    this.learningModel = this.createEmptyModel();
    await this.saveLearningModel();
    console.log('🔄 Learning model reset');
  }

  // 📊 EXPORT LEARNING DATA (for analysis)
  static async exportLearningData(): Promise<LearningModel | null> {
    if (!this.learningModel) await this.initialize();
    return this.learningModel;
  }
}