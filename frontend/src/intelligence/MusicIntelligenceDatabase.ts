// 🧠 ADVANCED MUSIC INTELLIGENCE DATABASE
// The most comprehensive Tamil/English music database for perfect mood matching

export interface ArtistProfile {
  name: string;
  aliases: string[];
  language: 'Tamil' | 'English';
  popularity: number; // 1-100
  specialties: string[];
  activeYears: [number, number];
  genres: string[];
  moodStrength: { [mood: string]: number }; // 1-100 how well they match each mood
}

export interface SongPattern {
  keywords: string[];
  artists: string[];
  searchTerms: string[];
  avoidTerms: string[];
  popularity: number;
}

export class MusicIntelligenceDatabase {
  
  // 🎭 COMPREHENSIVE TAMIL ARTIST DATABASE
  static readonly TAMIL_ARTISTS: ArtistProfile[] = [
    // DANCE SPECIALISTS
    {
      name: "Anirudh Ravichander",
      aliases: ["anirudh", "anirudh ravichander", "ani"],
      language: "Tamil",
      popularity: 100,
      specialties: ["dance", "energy", "youth", "mass"],
      activeYears: [2011, 2024],
      genres: ["kollywood", "hip-hop", "electronic", "kuthu"],
      moodStrength: { Dance: 100, Energetic: 95, Motivational: 85, Neutral: 70, Love: 60, Calm: 30 }
    },
    {
      name: "Harris Jayaraj",
      aliases: ["harris", "harris jayaraj", "hj"],
      language: "Tamil",
      popularity: 95,
      specialties: ["melody", "dance", "romantic", "commercial"],
      activeYears: [1997, 2024],
      genres: ["kollywood", "melody", "dance", "pop"],
      moodStrength: { Dance: 90, Love: 95, Energetic: 80, Neutral: 85, Motivational: 70, Calm: 75 }
    },
    {
      name: "A.R. Rahman",
      aliases: ["a.r. rahman", "rahman", "ar rahman", "a r rahman"],
      language: "Tamil",
      popularity: 100,
      specialties: ["versatile", "melody", "spiritual", "international"],
      activeYears: [1992, 2024],
      genres: ["kollywood", "classical", "fusion", "world"],
      moodStrength: { Love: 100, Calm: 100, Motivational: 95, Neutral: 90, Energetic: 80, Dance: 85 }
    },
    {
      name: "Yuvan Shankar Raja",
      aliases: ["yuvan", "yuvan shankar raja", "ysr"],
      language: "Tamil",
      popularity: 90,
      specialties: ["rock", "hip-hop", "experimental", "youth"],
      activeYears: [1996, 2024],
      genres: ["kollywood", "rock", "hip-hop", "alternative"],
      moodStrength: { Energetic: 95, Dance: 85, Motivational: 90, Neutral: 75, Love: 70, Calm: 60 }
    },
    {
      name: "Ilaiyaraaja",
      aliases: ["ilaiyaraaja", "ilaiyaraja", "maestro", "isai gnani"],
      language: "Tamil",
      popularity: 100,
      specialties: ["classical", "melody", "legendary", "versatile"],
      activeYears: [1976, 2024],
      genres: ["kollywood", "classical", "folk", "orchestral"],
      moodStrength: { Calm: 100, Love: 100, Neutral: 95, Motivational: 85, Energetic: 70, Dance: 75 }
    },
    {
      name: "G.V. Prakash Kumar",
      aliases: ["gv prakash", "gv", "g.v. prakash"],
      language: "Tamil",
      popularity: 85,
      specialties: ["contemporary", "hip-hop", "melody", "youth"],
      activeYears: [2006, 2024],
      genres: ["kollywood", "hip-hop", "contemporary", "fusion"],
      moodStrength: { Dance: 85, Energetic: 80, Love: 75, Motivational: 70, Neutral: 70, Calm: 60 }
    },
    {
      name: "D. Imman",
      aliases: ["imman", "d. imman", "d imman"],
      language: "Tamil",
      popularity: 80,
      specialties: ["folk", "melody", "devotional", "rural"],
      activeYears: [2002, 2024],
      genres: ["kollywood", "folk", "devotional", "traditional"],
      moodStrength: { Calm: 85, Love: 80, Neutral: 85, Motivational: 75, Energetic: 65, Dance: 70 }
    },
    {
      name: "Hiphop Tamizha",
      aliases: ["hiphop tamizha", "hht", "adhi"],
      language: "Tamil",
      popularity: 90,
      specialties: ["hip-hop", "rap", "motivational", "patriotic"],
      activeYears: [2012, 2024],
      genres: ["tamil rap", "hip-hop", "motivational", "patriotic"],
      moodStrength: { Motivational: 100, Energetic: 95, Dance: 90, Neutral: 70, Love: 50, Calm: 40 }
    },
    {
      name: "Santhosh Narayanan",
      aliases: ["santhosh narayanan", "santhosh", "santhosh deva"],
      language: "Tamil",
      popularity: 85,
      specialties: ["experimental", "folk", "raw", "realistic"],
      activeYears: [2011, 2024],
      genres: ["kollywood", "folk", "experimental", "indie"],
      moodStrength: { Neutral: 90, Calm: 80, Energetic: 85, Motivational: 80, Dance: 75, Love: 70 }
    },
    {
      name: "S. Thaman",
      aliases: ["thaman", "s. thaman", "s thaman"],
      language: "Tamil",
      popularity: 80,
      specialties: ["commercial", "mass", "energy", "dance"],
      activeYears: [2008, 2024],
      genres: ["kollywood", "commercial", "mass", "electronic"],
      moodStrength: { Dance: 90, Energetic: 95, Motivational: 85, Neutral: 70, Love: 60, Calm: 50 }
    }
  ];

  // 🎵 COMPREHENSIVE ENGLISH ARTIST DATABASE  
  static readonly ENGLISH_ARTISTS: ArtistProfile[] = [
    // DANCE SPECIALISTS
    {
      name: "Calvin Harris",
      aliases: ["calvin harris", "calvin"],
      language: "English",
      popularity: 95,
      specialties: ["edm", "dance", "electronic", "festival"],
      activeYears: [2006, 2024],
      genres: ["edm", "dance", "electronic", "house"],
      moodStrength: { Dance: 100, Energetic: 95, Motivational: 70, Neutral: 60, Love: 65, Calm: 30 }
    },
    {
      name: "David Guetta",
      aliases: ["david guetta", "guetta"],
      language: "English",
      popularity: 95,
      specialties: ["edm", "dance", "club", "festival"],
      activeYears: [2001, 2024],
      genres: ["edm", "dance", "electronic", "progressive house"],
      moodStrength: { Dance: 100, Energetic: 95, Motivational: 75, Neutral: 55, Love: 60, Calm: 25 }
    },
    {
      name: "Martin Garrix",
      aliases: ["martin garrix", "garrix"],
      language: "English",
      popularity: 90,
      specialties: ["big room", "progressive house", "festival", "youth"],
      activeYears: [2012, 2024],
      genres: ["edm", "big room", "progressive house", "festival"],
      moodStrength: { Dance: 95, Energetic: 100, Motivational: 80, Neutral: 60, Love: 55, Calm: 30 }
    },
    {
      name: "The Weeknd",
      aliases: ["the weeknd", "weeknd", "abel"],
      language: "English",
      popularity: 100,
      specialties: ["pop", "r&b", "dark pop", "alternative"],
      activeYears: [2010, 2024],
      genres: ["pop", "r&b", "alternative r&b", "synth-pop"],
      moodStrength: { Love: 95, Energetic: 85, Dance: 80, Neutral: 90, Motivational: 70, Calm: 60 }
    },
    {
      name: "Dua Lipa",
      aliases: ["dua lipa", "dua"],
      language: "English",
      popularity: 95,
      specialties: ["dance-pop", "disco", "empowerment", "modern"],
      activeYears: [2015, 2024],
      genres: ["dance-pop", "disco", "pop", "electropop"],
      moodStrength: { Dance: 95, Energetic: 90, Love: 80, Motivational: 85, Neutral: 75, Calm: 40 }
    },
    // MOTIVATIONAL SPECIALISTS
    {
      name: "Eminem",
      aliases: ["eminem", "slim shady", "marshall mathers"],
      language: "English",
      popularity: 100,
      specialties: ["rap", "hip-hop", "motivation", "struggle"],
      activeYears: [1996, 2024],
      genres: ["hip-hop", "rap", "conscious rap"],
      moodStrength: { Motivational: 100, Energetic: 95, Dance: 70, Neutral: 80, Love: 50, Calm: 30 }
    },
    {
      name: "Kanye West",
      aliases: ["kanye west", "kanye", "ye"],
      language: "English",
      popularity: 95,
      specialties: ["hip-hop", "production", "innovative", "controversial"],
      activeYears: [1996, 2024],
      genres: ["hip-hop", "rap", "experimental hip-hop"],
      moodStrength: { Motivational: 95, Energetic: 90, Dance: 80, Neutral: 75, Love: 60, Calm: 40 }
    },
    // LOVE/CALM SPECIALISTS
    {
      name: "Adele",
      aliases: ["adele", "adele adkins"],
      language: "English",
      popularity: 100,
      specialties: ["soul", "ballads", "emotion", "heartbreak"],
      activeYears: [2006, 2024],
      genres: ["soul", "pop", "ballad"],
      moodStrength: { Love: 100, Calm: 95, Neutral: 90, Motivational: 70, Energetic: 50, Dance: 40 }
    },
    {
      name: "Ed Sheeran",
      aliases: ["ed sheeran", "ed"],
      language: "English",
      popularity: 100,
      specialties: ["acoustic", "pop", "romantic", "storytelling"],
      activeYears: [2004, 2024],
      genres: ["pop", "folk-pop", "acoustic"],
      moodStrength: { Love: 95, Calm: 85, Neutral: 90, Motivational: 60, Energetic: 70, Dance: 65 }
    },
    {
      name: "Billie Eilish",
      aliases: ["billie eilish", "billie"],
      language: "English",
      popularity: 95,
      specialties: ["alternative", "dark pop", "minimalist", "young"],
      activeYears: [2015, 2024],
      genres: ["alternative pop", "dark pop", "electropop"],
      moodStrength: { Calm: 90, Neutral: 95, Love: 75, Energetic: 60, Motivational: 70, Dance: 65 }
    }
  ];

  // 🎯 MOOD-SPECIFIC SEARCH PATTERNS
  static readonly MOOD_PATTERNS = {
    Dance: {
      Tamil: {
        keywords: ["kuthu", "dance", "mass", "beat", "groove", "party", "club", "thaandavam"],
        artists: ["anirudh ravichander", "harris jayaraj", "yuvan shankar raja", "s. thaman"],
        searchTerms: ["dance kollywood", "kuthu song", "mass tamil", "thalapathy dance", "vijay dance"],
        avoidTerms: ["sad", "slow", "melody", "breakup", "death"],
        popularity: 85
      },
      English: {
        keywords: ["dance", "beat", "groove", "party", "club", "edm", "electronic", "house"],
        artists: ["calvin harris", "david guetta", "martin garrix", "dua lipa", "tiesto"],
        searchTerms: ["dance hits", "edm 2024", "club music", "party songs", "festival anthems"],
        avoidTerms: ["ballad", "acoustic", "sad", "slow", "depressing"],
        popularity: 80
      }
    },
    Energetic: {
      Tamil: {
        keywords: ["energy", "power", "semma", "vera level", "high", "pump", "motivation"],
        artists: ["anirudh ravichander", "yuvan shankar raja", "hiphop tamizha", "s. thaman"],
        searchTerms: ["energetic tamil", "power songs kollywood", "motivation tamil", "pump up"],
        avoidTerms: ["sad", "slow", "calm", "peaceful", "lullaby"],
        popularity: 80
      },
      English: {
        keywords: ["energy", "power", "pump", "high", "electric", "boost", "adrenaline"],
        artists: ["martin garrix", "the weeknd", "imagine dragons", "twenty one pilots"],
        searchTerms: ["energetic hits", "pump up songs", "high energy", "workout music"],
        avoidTerms: ["ballad", "acoustic", "slow", "calm", "lullaby"],
        popularity: 85
      }
    },
    Love: {
      Tamil: {
        keywords: ["kadhal", "love", "romance", "heart", "feeling", "emotion", "beautiful"],
        artists: ["a.r. rahman", "harris jayaraj", "ilaiyaraaja", "d. imman"],
        searchTerms: ["love songs tamil", "romantic kollywood", "kadhal songs", "melody tamil"],
        avoidTerms: ["breakup", "sad", "angry", "fight", "violence"],
        popularity: 90
      },
      English: {
        keywords: ["love", "heart", "romance", "feeling", "emotion", "beautiful", "together"],
        artists: ["adele", "ed sheeran", "john legend", "alicia keys", "sam smith"],
        searchTerms: ["love songs", "romantic hits", "love ballads", "relationship songs"],
        avoidTerms: ["breakup", "heartbreak", "angry", "revenge", "hate"],
        popularity: 85
      }
    },
    Calm: {
      Tamil: {
        keywords: ["peace", "calm", "soft", "gentle", "soothing", "meditation", "spiritual"],
        artists: ["a.r. rahman", "ilaiyaraaja", "d. imman", "santhosh narayanan"],
        searchTerms: ["peaceful tamil", "calm kollywood", "spiritual songs", "meditation music"],
        avoidTerms: ["loud", "aggressive", "dance", "party", "club"],
        popularity: 75
      },
      English: {
        keywords: ["calm", "peace", "soft", "gentle", "acoustic", "chill", "relax"],
        artists: ["billie eilish", "lorde", "john mayer", "bon iver", "norah jones"],
        searchTerms: ["calm music", "acoustic hits", "chill songs", "relaxing music"],
        avoidTerms: ["loud", "aggressive", "heavy", "dance", "party"],
        popularity: 70
      }
    },
    Motivational: {
      Tamil: {
        keywords: ["motivation", "success", "fight", "win", "power", "strength", "achieve"],
        artists: ["hiphop tamizha", "a.r. rahman", "anirudh ravichander", "yuvan shankar raja"],
        searchTerms: ["motivational tamil", "inspiration kollywood", "success songs", "fight songs"],
        avoidTerms: ["sad", "defeat", "failure", "depression", "giving up"],
        popularity: 80
      },
      English: {
        keywords: ["motivation", "strong", "power", "rise", "fight", "win", "overcome", "achieve"],
        artists: ["eminem", "kanye west", "drake", "kendrick lamar", "linkin park"],
        searchTerms: ["motivational rap", "inspiration songs", "workout motivation", "success anthems"],
        avoidTerms: ["sad", "defeat", "failure", "depression", "giving up"],
        popularity: 85
      }
    },
    Neutral: {
      Tamil: {
        keywords: ["morning", "fresh", "new", "daily", "routine", "normal", "easy"],
        artists: ["harris jayaraj", "yuvan shankar raja", "santhosh narayanan", "gv prakash"],
        searchTerms: ["morning songs tamil", "fresh kollywood", "daily music", "feel good"],
        avoidTerms: ["extreme", "intense", "very sad", "very happy", "dramatic"],
        popularity: 75
      },
      English: {
        keywords: ["morning", "fresh", "easy", "smooth", "flow", "natural", "balanced"],
        artists: ["taylor swift", "coldplay", "maroon 5", "onerepublic", "imagine dragons"],
        searchTerms: ["feel good songs", "morning playlist", "easy listening", "pop hits"],
        avoidTerms: ["extreme", "intense", "heavy", "very sad", "very energetic"],
        popularity: 80
      }
    }
  };

  // 🔍 GET ARTISTS BY MOOD AND LANGUAGE
  static getArtistsByMood(mood: string, language: 'Tamil' | 'English', limit: number = 10): ArtistProfile[] {
    const artists = language === 'Tamil' ? this.TAMIL_ARTISTS : this.ENGLISH_ARTISTS;
    
    return artists
      .filter(artist => artist.moodStrength[mood] >= 70) // Only high-scoring artists
      .sort((a, b) => (b.moodStrength[mood] || 0) - (a.moodStrength[mood] || 0))
      .slice(0, limit);
  }

  // 🎯 GET SEARCH PATTERNS
  static getMoodPattern(mood: string, language: 'Tamil' | 'English'): any {
    return this.MOOD_PATTERNS[mood as keyof typeof this.MOOD_PATTERNS]?.[language] || null;
  }

  // 🧠 INTELLIGENT ARTIST SCORING
  static scoreArtistForMood(artistName: string, mood: string, language: 'Tamil' | 'English'): number {
    const artists = language === 'Tamil' ? this.TAMIL_ARTISTS : this.ENGLISH_ARTISTS;
    
    const artist = artists.find(a => 
      a.name.toLowerCase() === artistName.toLowerCase() || 
      a.aliases.some(alias => alias.toLowerCase() === artistName.toLowerCase())
    );
    
    if (!artist) return 0;
    
    const moodScore = artist.moodStrength[mood] || 0;
    const popularityBonus = artist.popularity * 0.3;
    const recencyBonus = (2024 - artist.activeYears[0]) * 0.1;
    
    return moodScore + popularityBonus + recencyBonus;
  }
}